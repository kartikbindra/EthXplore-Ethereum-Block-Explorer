// search bar component for showning the txns, or the account details of the entered txn hash or account address
import React, { useState } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import axios from 'axios';

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  };
  
  const alchemy = new Alchemy(settings);

function SearchBar() {
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState();
    
    const search = async () => {
        if(!searchValue) return;
        // check if the searchValue is a transaction hash or an account address
        let response = [];
        if(searchValue.length === 66) {
            // if it is a transaction hash, call alchemy.core.getTransactionReceipt
            const txnReceipt = await alchemy.core.getTransactionReceipt(searchValue);
            response = txnReceipt ? [txnReceipt] : [];
        } else {
            // if it is an account address, call alchemy.core.getAssetTransfers
            // for the outgoing transactions
            const outgoingResponse = await alchemy.core.getAssetTransfers({
                fromBlock: "0x0",
                fromAddress: searchValue,
                toAddress: "0x0000000000000000000000000000000000000000",
                excludeZeroValue: true,
                category: ["erc721", "erc1155"],
            });
            // for the incoming transactions
            const incomingResponse = await alchemy.core.getAssetTransfers({
                fromBlock: "0x0",
                toAddress: searchValue,
                fromAddress: "0x0000000000000000000000000000000000000000",
                excludeZeroValue: true,
                category: ["erc721", "erc1155"],
            });
            response = [...outgoingResponse.transfers, ...incomingResponse.transfers];
        }
        setSearchResult(response);
        console.log(response);
    };
    
    return (
        <div className='bg-gray-200 p-4 rounded-md mt-4'>
        <div className='flex gap-4'>
        <input
            type='text'
            placeholder='Enter a transaction hash or account address'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className='p-2 border border-gray-300 rounded-md w-full'
        />
        <button
            onClick={(e) => {
            e.preventDefault();
            search();
            // empty the input field after search and set search value to empty string
            setSearchValue('');

            }}
            className='bg-gray-800 text-white p-2 rounded-md'
        >
            Search
        </button>
        </div>
        {searchResult && (
            <div className='bg-gray-200 p-4 rounded-md overflow-auto mt-4'>
            <pre>{JSON.stringify(searchResult, null, 2)}</pre>
            </div>
        )}
        </div>
    );
    }

    export default SearchBar;