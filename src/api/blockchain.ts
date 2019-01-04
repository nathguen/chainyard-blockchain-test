import { httpGet } from "./api";

interface GeneralResponse {
  success: boolean
  headers: any
  errorData: any
  results: any
}

export interface Blockchain {
  block_index: number
  hash: string
  height: number
  time: number
  txIndexes: number[]
}

interface BlockchainResults extends GeneralResponse {
  results: Blockchain | null
}

export async function fetchLatestBlock(): Promise<BlockchainResults> {
  return httpGet('https://cors-anywhere.herokuapp.com/https://blockchain.info/latestblock');
}

interface BlockchainTXInputs {
  sequence: number
  witness: string
  script: string
  value?: number
}

interface BlockChainTXOut {
  spent: boolean
  tx_index: number
  type: number
  addr: string
  value?: number
  n: number
  script: string
}

export interface BlockchainTX {
  inputs: BlockchainTXInputs[]
  weight: number
  block_height: number
  relayed_by: "0.0.0.0"
  out: BlockChainTXOut[]
  lock_time: number
  size: number
  double_spend: boolean
  block_index: number
  time: number
  tx_index: number
  vin_sz: number
  hash: string
  vout_sz: number
}

interface TransactionResults extends GeneralResponse {
  results: BlockchainTX | null
}


export async function fetchTransaction(txID: string | number): Promise<TransactionResults> {
  return httpGet(`https://cors-anywhere.herokuapp.com/https://blockchain.info/rawtx/${txID}`);
}