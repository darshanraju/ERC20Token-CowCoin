pragma solidity >=0.4.21 <0.7.0;

contract TodoList {
    uint public taskCount;

    struct Task {
        uint id;
        string content;
        bool completed;
    }


    mapping (uint => Task) public tasks;

    constructor () public {
        // createTask("First");
        // createTask("Second");
        // createTask("Third");
    }

    function createTask(string memory _content) public {
        tasks[taskCount] = Task(taskCount, _content, false);
        taskCount ++;
    }
}