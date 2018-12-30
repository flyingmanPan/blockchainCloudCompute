pragma solidity ^0.4.24;
contract CloudCompute
{

    struct vmInstance
    {
        uint vmType;
        string vmName;
        string vmToken;
        address vmUserAddr;
        address vmRunnerAddr;
        bool hadRun;
        string ipAddr;
        uint core;
        uint ramsize;
        uint vramsize;
        uint vpower;
    }

    vmInstance[] public vmInstances;

    uint len;

    //mapping (address=>uint) vmPublish;

    constructor () public
    {
        len = 0;
    }

    //event Issue(address account,uint amount);

    function createInstance(
        uint itype, 
        string memory iName,
        uint icore,
        uint iramsize,
        uint ivramsize,
        uint ivpower) public returns(bool sufficient)
    {
        vmInstances.push(vmInstance({
            vmType:itype,
            vmName:iName,
            core:icore,
            ramsize:iramsize,
            vramsize:ivramsize,
            vpower:ivpower,
            vmToken:"null",
            vmUserAddr:msg.sender,
            vmRunnerAddr:address(0x00),
            hadRun:false,
            ipAddr: "null"  //20 default
        }));
        return true;
    }
    

    function acceptInstance(uint index,string memory iipaddr,string memory token) public
    {
        vmInstances[index].vmRunnerAddr = msg.sender;
        vmInstances[index].hadRun = true;
        vmInstances[index].ipAddr = iipaddr;
        vmInstances[index].vmToken = token;
    }

    function getAllvmLen() public view returns (uint)
    {
        return vmInstances.length;
    }

    function getVm(uint index)public view returns(
        string memory,
        uint,
        uint,
        uint,
        uint,
        uint,
        address) {
        return(
            vmInstances[index].vmName,
            vmInstances[index].core,
            vmInstances[index].ramsize,
            vmInstances[index].vramsize,
            vmInstances[index].vpower,
            vmInstances[index].vmType,
            vmInstances[index].vmUserAddr);
    }

    function checkStatus(uint index) public view returns(bool sufficient)
    {
        return vmInstances[index].hadRun;
    }

    function accessVm(uint index) public view returns(
        string memory,string memory)
    {
        if(vmInstances[index].vmUserAddr != msg.sender) return ("error","error");
        return (vmInstances[index].ipAddr,vmInstances[index].vmToken);
    }

    
}