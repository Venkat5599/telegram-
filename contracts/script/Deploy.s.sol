// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SmartMoneyIndex} from "../src/SmartMoneyIndex.sol";
import {AgentIdentity} from "../src/AgentIdentity.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        vm.startBroadcast(pk);

        SmartMoneyIndex smi = new SmartMoneyIndex();
        AgentIdentity id = new AgentIdentity();
        uint256 agentId = id.register("veritas.mantle", vm.addr(pk));

        vm.stopBroadcast();

        console.log("SmartMoneyIndex:", address(smi));
        console.log("AgentIdentity:  ", address(id));
        console.log("Veritas agentId:", agentId);
    }
}
