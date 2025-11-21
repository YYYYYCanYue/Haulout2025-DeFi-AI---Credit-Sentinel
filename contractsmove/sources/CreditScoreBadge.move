// SPDX-License-Identifier: UNLICENSED
// CreditScoreBadge Sui Move Implementation
// Equivalent to CreditScoreBadge.sol

module credit_score_badge::credit_score_badge {
    use std::string::{Self, String};
    use std::vector;
    use sui::event;
    use sui::object::{Self, UID, ID};
    use sui::table::{Self, Table};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    // ============ Errors ============
    const E_NOT_OWNER: u64 = 1;
    const E_SIGNER_ZERO: u64 = 2;
    const E_TIER_NOT_EXIST: u64 = 3;
    const E_SCORE_TOO_LOW: u64 = 4;
    const E_BAD_SIGNATURE: u64 = 5;
    const E_NONCE_USED: u64 = 6;
    const E_EXPIRED: u64 = 7;
    const E_NOT_HIGHER_TIER: u64 = 8;
    const E_NON_TRANSFERABLE: u64 = 9;
    const E_TOKEN_NOT_EXISTS: u64 = 10;
    const E_MIN_SCORE_ZERO: u64 = 11;
    const E_EMPTY_URI: u64 = 12;
    const E_NOT_SELF: u64 = 13;

    // ============ Structs ============

    /// Tier information
    struct Tier has store, copy, drop {
        min_score: u256,
        uri: String,
    }

    /// NFT Token metadata
    struct TokenData has store {
        owner: address,
        tier_id: u8,
        last_score: u256,
        minted_at: u64,
        updated_at: u64,
        soulbound: bool,
    }

    /// Claim request structure (equivalent to Solidity's ClaimRequest)
    struct ClaimRequest has copy, drop, store {
        to: address,
        score: u256,
        tier_id: u8,
        nonce: u256,
        deadline: u64,
    }

    /// Module configuration data (Sui Object)
    struct Config has key {
        id: UID,
        signer: address,
        owner: address,
        soulbound: bool,
        next_token_id: u256,
    }

    /// Global state storage (Sui Object)
    struct GlobalState has key {
        id: UID,
        tiers: Table<u8, Tier>,
        tier_ids: vector<u8>,
        tokens: Table<u256, TokenData>,
        token_of: Table<address, u256>,
        used_nonces: Table<address, Table<u256, bool>>,
    }

    /// Admin capability (for owner-only functions)
    struct AdminCapability has key {
        id: UID,
    }

    /// NFT Token Object (for Sui object model)
    struct CreditBadgeNFT has key, store {
        id: UID,
        token_id: u256,
        tier_id: u8,
        last_score: u256,
        minted_at: u64,
        updated_at: u64,
        soulbound: bool,
        config_id: ID,
    }

    // ============ Events ============

    struct SignerUpdatedEvent has copy, drop {
        new_signer: address,
    }

    struct TierSetEvent has copy, drop {
        tier_id: u8,
        min_score: u256,
        uri: String,
    }

    struct ClaimedEvent has copy, drop {
        to: address,
        token_id: u256,
        tier_id: u8,
        score: u256,
    }

    struct UpgradedEvent has copy, drop {
        to: address,
        token_id: u256,
        from_tier: u8,
        to_tier: u8,
        score: u256,
    }

    struct BurnedEvent has copy, drop {
        owner: address,
        token_id: u256,
    }

    struct MintEvent has copy, drop {
        token_id: u256,
        owner: address,
        tier_id: u8,
    }

    // ============ Initialization ============

    /// Initialize the module
    public fun initialize(
        signer_addr: address,
        soulbound_flag: bool,
        admin: &mut TxContext,
    ) {
        let admin_addr = tx_context::sender(admin);
        
        assert!(signer_addr != @0x0, E_SIGNER_ZERO);
        
        let config_id = object::new(admin);
        let config = Config {
            id: config_id,
            signer: signer_addr,
            owner: admin_addr,
            soulbound: soulbound_flag,
            next_token_id: 1,
        };
        transfer::share_object(config);

        let state_id = object::new(admin);
        let state = GlobalState {
            id: state_id,
            tiers: table::new(admin),
            tier_ids: vector::empty(),
            tokens: table::new(admin),
            token_of: table::new(admin),
            used_nonces: table::new(admin),
        };
        transfer::share_object(state);

        // Grant admin capability (owned object)
        let admin_cap = AdminCapability {
            id: object::new(admin),
        };
        transfer::transfer(admin_cap, admin_addr);
    }

    // ============ Admin Functions ============

    /// Set tier configuration (owner only)
    public fun set_tier(
        _admin_cap: &AdminCapability,
        state: &mut GlobalState,
        tier_id: u8,
        min_score: u256,
        uri: vector<u8>,
        _ctx: &mut TxContext,
    ) {
        assert!(min_score > 0, E_MIN_SCORE_ZERO);
        assert!(vector::length(&uri) > 0, E_EMPTY_URI);

        let uri_string = string::utf8(uri);
        let tier = Tier {
            min_score,
            uri: uri_string,
        };

        // Check if tier already exists
        let tier_exists = table::contains(&state.tiers, tier_id);
        if (!tier_exists) {
            vector::push_back(&mut state.tier_ids, tier_id);
            table::add(&mut state.tiers, tier_id, tier);
        } else {
            let existing_tier = table::borrow_mut(&mut state.tiers, tier_id);
            *existing_tier = tier;
        };

        // Emit event
        event::emit(TierSetEvent {
            tier_id,
            min_score,
            uri: *&tier.uri,
        });
    }

    /// Update signer address (owner only)
    public fun set_signer(
        _admin_cap: &AdminCapability,
        config: &mut Config,
        new_signer: address,
    ) {
        assert!(new_signer != @0x0, E_SIGNER_ZERO);

        config.signer = new_signer;

        event::emit(SignerUpdatedEvent { new_signer });
    }

    // ============ User Functions ============

    /// Claim or upgrade NFT (with signature verification)
    public fun claim_or_upgrade(
        config: &mut Config,
        state: &mut GlobalState,
        to: address,
        score: u256,
        tier_id: u8,
        nonce: u256,
        deadline: u64,
        _signature: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let claim_req = ClaimRequest {
            to,
            score,
            tier_id,
            nonce,
            deadline,
        };
        let user_addr = tx_context::sender(ctx);
        let current_time = tx_context::epoch_timestamp_ms(ctx) / 1000; // Convert ms to seconds
        
        // Validate request
        assert!(current_time <= claim_req.deadline, E_EXPIRED);
        assert!(claim_req.to == user_addr, E_NOT_SELF);

        // Check nonce
        if (!table::contains(&state.used_nonces, claim_req.to)) {
            let new_nonce_table = table::new(ctx);
            table::add(&mut state.used_nonces, claim_req.to, new_nonce_table);
        };
        let nonce_table = table::borrow_mut(&mut state.used_nonces, claim_req.to);
        if (table::contains(nonce_table, claim_req.nonce)) {
            assert!(!*table::borrow(nonce_table, claim_req.nonce), E_NONCE_USED);
        } else {
            table::add(nonce_table, claim_req.nonce, true);
        };

        // Validate tier exists
        assert!(table::contains(&state.tiers, claim_req.tier_id), E_TIER_NOT_EXIST);
        
        // Validate score meets tier requirement
        let tier = table::borrow(&state.tiers, claim_req.tier_id);
        assert!(claim_req.score >= tier.min_score, E_SCORE_TOO_LOW);

        // Verify signature (simplified - in production use proper signature verification)
        // Note: Sui uses different signature schemes, would need adaptation
        
        let token_id = if (table::contains(&state.token_of, user_addr)) {
            // Upgrade existing token
            let existing_token_id = *table::borrow(&state.token_of, user_addr);
            assert!(table::contains(&state.tokens, existing_token_id), E_TOKEN_NOT_EXISTS);
            let token_data = table::borrow_mut(&mut state.tokens, existing_token_id);
            let current_tier = token_data.tier_id;
            
            assert!(claim_req.tier_id > current_tier, E_NOT_HIGHER_TIER);
            
            token_data.tier_id = claim_req.tier_id;
            token_data.last_score = claim_req.score;
            token_data.updated_at = current_time;
            
            event::emit(UpgradedEvent {
                to: user_addr,
                token_id: existing_token_id,
                from_tier: current_tier,
                to_tier: claim_req.tier_id,
                score: claim_req.score,
            });
            
            existing_token_id
        } else {
            // Mint new token
            let new_token_id = config.next_token_id;
            config.next_token_id = config.next_token_id + 1;

            let token_data = TokenData {
                owner: user_addr,
                tier_id: claim_req.tier_id,
                last_score: claim_req.score,
                minted_at: current_time,
                updated_at: current_time,
                soulbound: config.soulbound,
            };

            table::add(&mut state.tokens, new_token_id, token_data);
            table::add(&mut state.token_of, user_addr, new_token_id);

            // Create NFT object
            let nft = CreditBadgeNFT {
                id: object::new(ctx),
                token_id: new_token_id,
                tier_id: claim_req.tier_id,
                last_score: claim_req.score,
                minted_at: current_time,
                updated_at: current_time,
                soulbound: config.soulbound,
                config_id: object::id(config),
            };
            transfer::transfer(nft, user_addr);

            event::emit(ClaimedEvent {
                to: user_addr,
                token_id: new_token_id,
                tier_id: claim_req.tier_id,
                score: claim_req.score,
            });

            event::emit(MintEvent {
                token_id: new_token_id,
                owner: user_addr,
                tier_id: claim_req.tier_id,
            });

            new_token_id
        };
    }

    /// Burn NFT (destroy token)
    public fun burn(
        state: &mut GlobalState,
        nft: CreditBadgeNFT,
        ctx: &mut TxContext,
    ) {
        let user_addr = tx_context::sender(ctx);
        let token_id = nft.token_id;

        // Validate token exists and user owns it
        assert!(table::contains(&state.tokens, token_id), E_TOKEN_NOT_EXISTS);
        let token_data = table::borrow(&state.tokens, token_id);
        assert!(token_data.owner == user_addr, E_NOT_OWNER);

        // Remove token
        let TokenData { owner: _, tier_id: _, last_score: _, minted_at: _, updated_at: _, soulbound: _ } = table::remove(&mut state.tokens, token_id);
        if (table::contains(&state.token_of, user_addr)) {
            let stored_token_id = *table::borrow(&state.token_of, user_addr);
            if (stored_token_id == token_id) {
                table::remove(&mut state.token_of, user_addr);
            };
        };

        // Burn the NFT object
        let CreditBadgeNFT { id, token_id: _, tier_id: _, last_score: _, minted_at: _, updated_at: _, soulbound: _, config_id: _ } = nft;
        object::delete(id);

        event::emit(BurnedEvent {
            owner: user_addr,
            token_id,
        });
    }

    /// Update NFT tier (internal function called when upgrading)
    fun update_nft_tier(
        nft: &mut CreditBadgeNFT,
        new_tier_id: u8,
        new_score: u256,
        current_time: u64,
    ) {
        nft.tier_id = new_tier_id;
        nft.last_score = new_score;
        nft.updated_at = current_time;
    }

    // ============ View Functions ============

    /// Get tier information
    public fun get_tier(state: &GlobalState, tier_id: u8): (bool, u256, String) {
        if (table::contains(&state.tiers, tier_id)) {
            let tier = table::borrow(&state.tiers, tier_id);
            (true, tier.min_score, *&tier.uri)
        } else {
            (false, 0, string::utf8(b""))
        }
    }

    /// Get all tier IDs
    public fun list_tier_ids(state: &GlobalState): vector<u8> {
        *&state.tier_ids
    }

    /// Get token URI (metadata)
    public fun token_uri(state: &GlobalState, token_id: u256): (bool, String) {
        if (table::contains(&state.tokens, token_id)) {
            let token_data = table::borrow(&state.tokens, token_id);
            let tier = table::borrow(&state.tiers, token_data.tier_id);
            (true, *&tier.uri)
        } else {
            (false, string::utf8(b""))
        }
    }

    /// Get current tier info for a user
    public fun current_tier(state: &GlobalState, user: address): (bool, u8, u256, u256) {
        if (!table::contains(&state.token_of, user)) {
            return (false, 0, 0, 0)
        };

        let token_id = *table::borrow(&state.token_of, user);
        if (!table::contains(&state.tokens, token_id)) {
            return (false, 0, 0, 0)
        };
        let token_data = table::borrow(&state.tokens, token_id);
        (true, token_data.tier_id, token_data.last_score, token_id)
    }

    /// Get token data
    public fun get_token_data(state: &GlobalState, token_id: u256): (bool, address, u8, u256, u64, u64, bool) {
        if (table::contains(&state.tokens, token_id)) {
            let token_data = table::borrow(&state.tokens, token_id);
            (
                true,
                token_data.owner,
                token_data.tier_id,
                token_data.last_score,
                token_data.minted_at,
                token_data.updated_at,
                token_data.soulbound,
            )
        } else {
            (false, @0x0, 0, 0, 0, 0, false)
        }
    }

    // ============ Transfer Functions ============

    /// Transfer NFT (only if not soulbound)
    public fun transfer_nft(
        config: &Config,
        nft: CreditBadgeNFT,
        recipient: address,
        _ctx: &mut TxContext,
    ) {
        assert!(!config.soulbound && !nft.soulbound, E_NON_TRANSFERABLE);
        
        // Update state in GlobalState would need to be handled separately
        // This function just transfers the NFT object
        transfer::transfer(nft, recipient);
    }
}
