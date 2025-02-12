import { getContract } from '@wagmi/core'
import { ethers } from 'ethers'

import { auctionAbi } from 'src/data/contract/abis'
import { CHAIN_ID } from 'src/typings'

import { getProvider } from '../../../utils/provider'

export interface Bid {
  id: number
  bidder: string
  amount: string
  transactionHash: string
}

const readAuctionBidEvents = async (
  chainId: CHAIN_ID,
  auctionAddress: string
): Promise<Bid[]> => {
  const provider = getProvider(chainId)
  const contract = getContract({
    abi: auctionAbi,
    address: auctionAddress,
    signerOrProvider: provider,
  })

  // reading all 'AuctionBid' events from block 0 to latest block
  // an idea could be to get block number of previous tokens mint and start from there
  const auctionEvents = await contract.queryFilter('AuctionBid', 0, 'latest')

  return auctionEvents.map((event) => {
    return {
      id: parseInt(event.args?.tokenId?._hex, 16),
      bidder: event.args?.bidder,
      amount: ethers.utils.formatEther(event.args?.amount),
      transactionHash: event.transactionHash,
    }
  })
}

async function getBids(
  chainId: CHAIN_ID,
  auction: string,
  tokenId: string | number
): Promise<Bid[]> {
  try {
    const events = await readAuctionBidEvents(chainId, auction)

    return events
      ?.filter((event) => event.id === Number(tokenId))
      .sort((a, b) => (Number(a.amount) > Number(b.amount) ? -1 : 1))
  } catch (err) {
    console.warn(err)
    return []
  }
}

export default getBids
