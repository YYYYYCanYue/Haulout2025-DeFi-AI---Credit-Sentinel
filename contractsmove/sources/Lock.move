// SPDX-License-Identifier: UNLICENSED
// Lock Sui Move Implementation
// Equivalent to Lock.sol

module lock::lock {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::object::{Self, UID};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    // ============ Errors ============
    const E_UNAUTHORIZED: u64 = 1;
    const E_LOCKED: u64 = 2;
    const E_INVALID_UNLOCK_TIME: u64 = 3;
    const E_INSUFFICIENT_BALANCE: u64 = 4;

    // ============ Structs ============

    /// Lock contract state (Sui Object)
    struct Lock has key {
        id: UID,
        unlock_time: u64,
        owner: address,
        balance: Balance<SUI>,
    }

    /// Withdrawal event
    struct WithdrawalEvent has copy, drop {
        amount: u64,
        when: u64,
    }

    /// Deposit event
    struct DepositEvent has copy, drop {
        amount: u64,
        depositor: address,
    }

    // ============ Initialization ============

    /// Initialize the lock contract
    /// `unlock_time` must be in the future (timestamp in seconds)
    public fun initialize(
        unlock_time: u64,
        owner: &mut TxContext,
    ) {
        let current_time = tx_context::epoch_timestamp_ms(owner) / 1000; // Convert ms to seconds
        assert!(current_time < unlock_time, E_INVALID_UNLOCK_TIME);

        let owner_addr = tx_context::sender(owner);
        let lock = Lock {
            id: object::new(owner),
            unlock_time,
            owner: owner_addr,
            balance: balance::zero(),
        };
        
        // Transfer ownership to the owner
        transfer::transfer(lock, owner_addr);
    }

    /// Initialize and deposit coins
    public fun initialize_with_coins(
        unlock_time: u64,
        deposit_coin: Coin<SUI>,
        owner: &mut TxContext,
    ) {
        let current_time = tx_context::epoch_timestamp_ms(owner) / 1000;
        assert!(current_time < unlock_time, E_INVALID_UNLOCK_TIME);

        let owner_addr = tx_context::sender(owner);
        let deposit_amount = coin::value(&deposit_coin);
        
        let lock = Lock {
            id: object::new(owner),
            unlock_time,
            owner: owner_addr,
            balance: coin::into_balance(deposit_coin),
        };
        
        event::emit(DepositEvent {
            amount: deposit_amount,
            depositor: owner_addr,
        });
        
        transfer::transfer(lock, owner_addr);
    }

    // ============ Functions ============

    /// Deposit coins into the lock
    public fun deposit(
        lock: &mut Lock,
        deposit_coin: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let depositor = tx_context::sender(ctx);
        let amount = coin::value(&deposit_coin);
        
        balance::join(&mut lock.balance, coin::into_balance(deposit_coin));
        
        event::emit(DepositEvent {
            amount,
            depositor,
        });
    }

    /// Withdraw all locked coins (only after unlock time and by owner)
    public fun withdraw(
        lock: &mut Lock,
        ctx: &mut TxContext,
    ) {
        let owner_addr = tx_context::sender(ctx);
        
        // Verify sender is owner
        assert!(lock.owner == owner_addr, E_UNAUTHORIZED);
        
        // Verify unlock time has passed
        let current_time = tx_context::epoch_timestamp_ms(ctx) / 1000;
        assert!(current_time >= lock.unlock_time, E_LOCKED);

        // Get balance and withdraw
        let balance_amount = balance::value(&lock.balance);
        
        if (balance_amount > 0) {
            let withdraw_balance = balance::split(&mut lock.balance, balance_amount);
            let coins = coin::from_balance<SUI>(withdraw_balance, ctx);
            let recipient = tx_context::sender(ctx);
            transfer::public_transfer(coins, recipient);

            // Emit event
            event::emit(WithdrawalEvent {
                amount: balance_amount,
                when: current_time,
            });
        };
    }

    /// Withdraw a specific amount of coins
    public fun withdraw_amount(
        lock: &mut Lock,
        amount: u64,
        ctx: &mut TxContext,
    ) {
        let owner_addr = tx_context::sender(ctx);
        
        // Verify sender is owner
        assert!(lock.owner == owner_addr, E_UNAUTHORIZED);
        
        // Verify unlock time has passed
        let current_time = tx_context::epoch_timestamp_ms(ctx) / 1000;
        assert!(current_time >= lock.unlock_time, E_LOCKED);

        // Verify sufficient balance
        let balance_amount = balance::value(&lock.balance);
        assert!(balance_amount >= amount, E_INSUFFICIENT_BALANCE);

        // Withdraw amount
        let withdraw_balance = balance::split(&mut lock.balance, amount);
        let coins = coin::from_balance<SUI>(withdraw_balance, ctx);
        let recipient = tx_context::sender(ctx);
        transfer::public_transfer(coins, recipient);

        // Emit event
        event::emit(WithdrawalEvent {
            amount,
            when: current_time,
        });
    }

    // ============ View Functions ============

    /// Get unlock time
    public fun get_unlock_time(lock: &Lock): u64 {
        lock.unlock_time
    }

    /// Get owner address
    public fun get_owner(lock: &Lock): address {
        lock.owner
    }

    /// Get locked balance
    public fun get_balance(lock: &Lock): u64 {
        balance::value(&lock.balance)
    }

    /// Check if lock is unlocked
    public fun is_unlocked(lock: &Lock, ctx: &TxContext): bool {
        let current_time = tx_context::epoch_timestamp_ms(ctx) / 1000;
        current_time >= lock.unlock_time
    }

    // ============ Admin Functions ============

    /// Update unlock time (owner only)
    public fun update_unlock_time(
        lock: &mut Lock,
        new_unlock_time: u64,
        ctx: &mut TxContext,
    ) {
        let owner_addr = tx_context::sender(ctx);
        
        assert!(lock.owner == owner_addr, E_UNAUTHORIZED);
        
        // New unlock time must be in the future
        let current_time = tx_context::epoch_timestamp_ms(ctx) / 1000;
        assert!(current_time < new_unlock_time, E_INVALID_UNLOCK_TIME);

        lock.unlock_time = new_unlock_time;
    }
}
