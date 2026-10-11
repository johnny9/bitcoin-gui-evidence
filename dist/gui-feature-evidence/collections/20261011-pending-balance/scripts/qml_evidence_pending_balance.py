#!/usr/bin/env python3
"""Prove real wallet funds are visible before confirmation and after maturity."""
import json
import os
from pathlib import Path

from qml_test_receive import _create_request, _open_activity, _open_receive
from qml_wallet_test_lib import WalletFlowHarness, rpc_call, wait_for_rpc
from evidence_helpers import check, select_wallet, shot, wait

os.environ['EVIDENCE_SCENARIO'] = 'pending-balance'
root = Path(os.environ['EVIDENCE_OUTPUT'])
h = WalletFlowHarness('evidence_pending_balance', 2600)
proof = {}


def rpc(method, params=None, wallet=None):
    return rpc_call(h.gui_rpc_port, method, params, wallet)


def balances(stage):
    state = rpc('getbalances', wallet='Balance_review')['mine']
    proof[stage] = state
    (root / 'logs/wallet-state.json').write_text(json.dumps(proof, indent=2) + '\n')
    return state


try:
    h.start_gui()
    g = h.driver
    wait_for_rpc(h.gui_rpc_port)
    g.wait_for_property('walletBadge', 'loading', False, timeout_ms=20000)
    g.set_property('appWindow', 'width', 1180)
    g.set_property('appWindow', 'height', 1000)
    rpc('createwallet', {'wallet_name': 'Fixture_sender'})
    mining = rpc('getnewaddress', wallet='Fixture_sender')
    rpc('generatetoaddress', [103, mining])
    rpc('createwallet', {'wallet_name': 'Balance_review'})
    available_address = rpc('getnewaddress', ['Confirmed funds'], 'Balance_review')
    rpc('sendtoaddress', [available_address, 1.5], 'Fixture_sender')
    rpc('generatetoaddress', [1, mining])
    reward_address = rpc('getnewaddress', ['Immature mining reward'], 'Balance_review')
    reward_block = rpc('generatetoaddress', [1, reward_address])[0]
    reward_txid = rpc('getblock', [reward_block])['tx'][0]
    select_wallet(g, 'Balance_review')
    _open_receive(g)
    _create_request(g, '0.75', 'Unpaid request', 'Excluded from pending funds')
    _open_activity(g)

    incoming_address = rpc('getnewaddress', ['Incoming mempool payment'], 'Balance_review')
    pending_txid = rpc('sendtoaddress', [incoming_address, 0.125], 'Fixture_sender')
    proof['incomingTransaction'] = pending_txid
    proof['minedTransaction'] = reward_txid
    proof['mempoolBefore'] = rpc('getrawmempool')
    check('transaction-in-mempool', 'F07.S01', 'The pending payment is in the node mempool.', pending_txid in proof['mempoolBefore'])
    wait(lambda: rpc('getbalances', wallet='Balance_review')['mine']['untrusted_pending'] == 0.125)
    state = balances('beforeConfirmation')
    check('funds-in-distinct-states', 'F07.S01', 'The selected wallet has available, unconfirmed, and immature funds.',
          [state['trusted'], state['untrusted_pending'], state['immature']], [1.5, 0.125, 50])
    g.wait_for_property('walletBadge', 'balanceSatoshi', 150000000, timeout_ms=20000)
    g.wait_for_property('activityFilterProxyModel', 'pendingBalanceSat', 12500000, timeout_ms=20000)
    g.wait_for_property('activityPendingBalance', 'visible', True, timeout_ms=20000)
    g.wait_for_property('activityFilterProxyModel', 'requestCount', 1, timeout_ms=20000)
    shot(g, 'pending-mempool-payment-and-wallet-funds')
    check('pending-label-and-value', 'F07.S01', 'The visible Pending subtotal shows the 0.125 BTC mempool payment.',
          g.get_text('activityPendingBalance').replace('\u2009', ' ').replace('\u00a0', ' ').strip(), '+0.12500000 ₿')
    check('unpaid-request-excluded', 'F07.S01', 'The visible 0.75 BTC unpaid request does not increase the Pending subtotal.',
          g.get_property('activityFilterProxyModel', 'pendingBalanceSat'), 12500000)
    check('unconfirmed-explanation', 'F07.S01', 'The payment row tells the user it is unconfirmed.',
          'Unconfirmed' in g.get_property('activityItem_' + pending_txid, 'metadata'))
    check('immature-explanation', 'F07.S01', 'The mined funds show how long they remain immature.',
          'Matures in 100 blocks' in g.get_property('activityItem_' + reward_txid, 'metadata'))
    check('available-balance', 'F07.S01', 'The wallet balance excludes pending and immature funds.',
          g.get_property('walletBadge', 'balanceSatoshi'), 150000000)

    g.set_text('activitySearchField', 'Unpaid request')
    g.wait_for_property('activityFilterProxyModel', 'transactionCount', 0, timeout_ms=10000)
    g.wait_for_property('activityFilterProxyModel', 'pendingBalanceSat', 0, timeout_ms=10000)
    check('pending-follows-activity-filter', 'F07.S01', 'The Pending subtotal follows visible activity and is hidden when only an unpaid request remains.',
          g.get_property('activityPendingBalance', 'visible'), False)
    check('filter-preserves-wallet-balance', 'F07.S01', 'Filtering activity leaves the wallet balance unchanged.',
          g.get_property('walletBadge', 'balanceSatoshi'), 150000000)
    g.set_text('activitySearchField', '')
    g.wait_for_property('activityFilterProxyModel', 'pendingBalanceSat', 12500000, timeout_ms=10000)

    rpc('generatetoaddress', [1, mining])
    state = balances('afterConfirmation')
    check('confirmed-wallet-funds', 'F07.S01', 'Confirmation moves the payment into the available wallet funds.',
          [state['trusted'], state['untrusted_pending'], state['immature']], [1.625, 0, 50])
    check('transaction-left-mempool', 'F07.S01', 'The confirmed payment is no longer in the mempool.', pending_txid in rpc('getrawmempool'), False)
    g.wait_for_property('walletBadge', 'balanceSatoshi', 162500000, timeout_ms=20000)
    g.wait_for_property('activityFilterProxyModel', 'pendingBalanceSat', 0, timeout_ms=20000)
    g.wait_for_property('activityItem_' + pending_txid, 'depth', 1, timeout_ms=20000)
    check('confirmed-payment-explanation', 'F07.S01', 'The payment row changes from Unconfirmed to 1 confirmation.',
          '1 confirmation' in g.get_property('activityItem_' + pending_txid, 'metadata'))
    check('confirmed-pending-hidden', 'F07.S01', 'The Pending amount disappears after the payment confirms; the unpaid request stays.',
          g.get_property('activityPendingBalance', 'visible'), False)
    shot(g, 'payment-confirmed-pending-amount-cleared')

finally:
    h.stop()
