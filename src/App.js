import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './searchbar';
import wavesLight from './waves-light.svg';

import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [block, setBlock] = useState();
  const [gasPrice, setGasPrice] = useState();
  const [ethPrice, setEthPrice] = useState();
  const [showBlockDetails, setShowBlockDetails] = useState(false);

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }
    async function getBlock() {
      setBlock(await alchemy.core.getBlock(blockNumber));
    }
    async function getGasPrice() {
      const gasInHexa = await alchemy.core.getGasPrice();
      setGasPrice(parseInt(gasInHexa._hex));
    }
    async function getEthPrice() {
      await axios.get(`https://api.g.alchemy.com/prices/v1/${settings.apiKey}/tokens/by-symbol?symbols=ETH`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then((data) => {
        setEthPrice(parseFloat(data.data.data[0].prices[0].value, 10).toFixed(2));
      });
    }

    getBlockNumber();
    getBlock();
    getGasPrice();
    getEthPrice();

  }, [blockNumber, gasPrice, ethPrice]);

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-4 px-2" style={{ backgroundImage: `url(${wavesLight})`, backgroundSize: 'cover' }}>
      <nav className=" bg-gray-800 text-white p-4 rounded-lg shadow-md">
        <div className='flex justify-between items-center'>
          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold'>EthXplore</h1>
            <p>Ethereum Block Explorer</p>
          </div>
          <div className='flex gap-4'>
            <div>Current Gas Price: {gasPrice / 1e9} Gwei</div>
            <div>ETH Price: ${ethPrice}</div>
          </div>
        </div>
      </nav>
      <SearchBar />
      <div className='flex gap-4 justify-between mt-4'>
      <div className='flex flex-col w-1/2'>
      <h2 className='text-xl font-medium mt-4'>Latest Block</h2>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div>Block Number: {blockNumber}</div>
        <div>
          {block && (
            <div>
              <h4 className="text-lg font-semibold mt-2 cursor-pointer" onClick={() => setShowBlockDetails(!showBlockDetails)}>
                {showBlockDetails ? 'Hide' : 'Show'} Block Details
              </h4>
              {showBlockDetails && (
                <pre className="bg-gray-700 p-2 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(block, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      <div className='flex flex-col w-1/2'>
      <div className='text-xl font-medium mt-4'>Latest Transactions</div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md max-h-96 overflow-auto">
        <div>
          {block && (
            // extract and show all the transactions from the block
            block.transactions.map((tx, index) => (
              <div key={index} className="bg-gray-700 rounded-lg mt-2 h-8 p-2 overflow-hidden">
                {JSON.stringify(tx, null, 2)}
              </div>
            ))
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

export default App;
