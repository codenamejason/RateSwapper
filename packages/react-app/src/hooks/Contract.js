/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from "@ethersproject/contracts";
import { useState, useEffect } from "react";

/*
  when you want to load a local contract's abi but supply a custom address
*/
/**
 * 
 * @param {provider} provider 
 * @param {address} address 
 * @param {abi} abi 
 */
export default function useContract(provider, address, abi) {
  const [contract, setContract] = useState();
  useEffect(() => {
    async function loadContract() {
      if (typeof provider !== "undefined" && address) {
        try {
          const customContract = new Contract(address, abi, provider);
          setContract(customContract)
        } catch (e) {
          console.log("ERROR LOADING CONTRACTS!!", e);
        }
      }
    }
    loadContract();
  }, [provider, address, abi]);

  return contract;
}
