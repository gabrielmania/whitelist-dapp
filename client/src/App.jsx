import { useState, useEffect, useRef } from "react";
import { Contract, providers } from "ethers";
import Web3Modal from "web3modal";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "./constants";

function App() {
  // `walletConnected` tracks if the user's wallet is connected
  const [walletConnected, setWalletConnected] = useState(false);
  // `joinedWhitelist` tracks if the user's address has already joined the whitelist
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // tracks the loading when transactions are on process
  const [loading, setLoading] = useState(false);
  // `numWhitelisted` tracks the number of the whitelisted addresses
  const [numWhitelisted, setNumWhitelisted] = useState("0");
  // `email` will save the inputed email to the state
  const [email, setEmail] = useState("");
  // reference to Web3 Modal for connecting to Metamask
  const web3ModalRef = useRef();

  // return a `signer` or `provider` depending on the passed argument to the function
  async function getProviderOrSigner(needSigner = false) {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();

    // check if user is connected to goerli network
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change the network to Goerli");
    }

    // if signer is needed return signer
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  }

  // add the current user to the whitelist
  async function addAddressWhitelist(email) {
    try {
      const signer = await getProviderOrSigner(true);
      // create new instance of Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.addAddressToWhitelist(email);
      setLoading(true);
      // wait for the `tx` transaction to finish
      await tx.wait();
      setLoading(false);
      // get the number of whitelisted addresses
      await getNumWhitelistedAddresses();
      setJoinedWhitelist(true);
    } catch (error) {
      console.error(error);
    }
  }

  // checks the address of the user it they are already whitelisted
  async function checkAddressWhitelisted() {
    try {
      const signer = await getProviderOrSigner(true);
      // create new instance of Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // get the address of the signer that is connected to the wallet
      const address = await signer.getAddress();
      // call the `whitelistAddresses` fx from the contract and will return
      // wheter true or false
      const isWhitelisted = await whitelistContract.whitelistAddresses(address);
      setJoinedWhitelist(isWhitelisted);
    } catch (error) {
      console.error(error);
    }
  }

  // get the number of the whitelisted addresses
  async function getNumWhitelistedAddresses() {
    try {
      const provider = await getProviderOrSigner();
      // create new instance of Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const numWhitelisted = await whitelistContract.numWhitelistAddresses();
      setNumWhitelisted(numWhitelisted);
    } catch (error) {
      console.error(error);
    }
  }

  // connects the wallet of the user
  async function connectWallet() {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      // check if address is in the whitelist
      checkAddressWhitelisted();
      // get the number of whitelisted addresses
      getNumWhitelistedAddresses();
    } catch (error) {
      console.error(error);
    }
  }

  // hande the changes in the input box
  function handleChange(evt) {
    setEmail(evt.target.value);
  }

  // handle the click event on the `Join Whitelist` button. it will call the 
  // `addAddressWhitelist` function and pass the email as an argument
  function handleClick(evt) {
    evt.preventDefault();
    addAddressWhitelist(email);
  }

  useEffect(() => {
    // creates new instance of of Web3Modal if wallet is not yet connected
    if (!walletConnected) {
      // assign the instance to the `web3ModalRef` that will persist as long
      // as the page is opened
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-5">Welcome to Blockchain Nexus!</h1>
      <p className="text-xl mb-3">
        It's an NFT collection for Crpyto developers like you and us!
      </p>
      <p className="text-xl mb-10">
        There are {numWhitelisted}/10 people who have joined the whitelist!
      </p>
      {!walletConnected ? (
        <button className="btn btn-primary" onClick={connectWallet}>
          Connect your Wallet!
        </button>
      ) : !joinedWhitelist ? (
        <>
          <p className="text-xl mb-3">
            Input your email so we can add you to the whitelist and contact you
            when we open our platform.
          </p>
          <div className="form-control">
            <label className="input-group">
              <input
                type="text"
                placeholder="info@site.com"
                className="input input-bordered"
                onChange={handleChange}
                value={email}
              />
              <button className="btn" onClick={handleClick}>
                {!loading ? "Join Whitelist!" : "Loading..."}
                
              </button>
            </label>
          </div>
        </>
      ) : (
        <p className="text-2xl font-bold text-blue-700">
          Thank you for joining the whitelist!
        </p>
      )}
    </div>
  );
}

export default App;
