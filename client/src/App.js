import React, { Component, useState, useEffect } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import TodoList from "./contracts/TodoList.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const App = () => {
  const [storedValue, setStoredValue] = useState(0);
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [contract, setContract] = useState();

  const [todoListContract, setToDoListContract] = useState();
  const [todoList, setTodoList] = useState();

  const [todo, setToDo] = useState("");

  const connectToWeb3 = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      setWeb3(web3);

      // Use web3 to get the user's accounts.
      const currAccounts = await web3.eth.getAccounts();
      setAccounts(currAccounts);

      // Get the blockchain network our smart contracts are on
      const networkId = await web3.eth.net.getId();

      //Get the networks object of the SimpleStorage smart contract on this network
      let deployedNetwork = SimpleStorageContract.networks[networkId];

      //Get the instance of the smart contract on the network using its ABI and
      //the address of the smart contract on the network

      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      setContract(instance);

      deployedNetwork = TodoList.networks[networkId];

      //Get current todos
      const toListContract = new web3.eth.Contract(
        TodoList.abi,
        deployedNetwork && deployedNetwork.address
      );
      setToDoListContract(toListContract);

      getTodos(toListContract);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  const runExample = async () => {
    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    setStoredValue(response);
  };

  useEffect(() => {
    connectToWeb3();
  }, [connectToWeb3]);

  const getTodos = async (todoListContractPassed) => {
    const test = todoListContractPassed
      ? todoListContractPassed
      : todoListContract;
    const todoListLength = await test.methods.taskCount().call();

    const todos = [];

    for (let i = 0; i < todoListLength; i++) {
      let nextTodo = await test.methods.tasks(i).call();
      todos.push(nextTodo);
    }

    console.log("New Todos: ");
    console.log(todos);

    setTodoList(todos);
  };

  const addTodo = async () => {
    await todoListContract.methods.createTask(todo).send({ from: accounts[0] });
    setToDo("");
    await getTodos();
  };

  return (
    <>
      <div className="App">
        <h1>Good to Go!</h1>
        <p>
          Connected to your local blockchain. <br />
          network_id: "*" <br />
          host: "localhost" <br />
          port: 8545{" "}
        </p>
        <h2>Smart Contract Example</h2>
        <div>
          {contract && (
            <button onClick={runExample}>
              Set stored value in smart contract to 5
            </button>
          )}
        </div>
        <div>The stored value is: {storedValue}</div>

        {todoListContract && (
          <>
            <input
              value={todo}
              onChange={(e) => setToDo(e.target.value)}
            ></input>
            <button onClick={addTodo}>Add todo</button>
          </>
        )}
        <div>Todos stored in smart contract</div>

        {todoList && (
          <ul>
            {todoList.map((todo, idx) => (
              <>
                <div key={idx}>{todo[1]}</div>
              </>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default App;
