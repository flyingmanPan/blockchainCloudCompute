# How to run

Develop environment: `Windows 10 1809`, `powershell` with `truffle` and `Chrome 71`

Before using truffle, we need to use [ganachi](https://truffleframework.com/ganache) to run our private network;

Use nodejs to handle everything well;

Use [metamask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) to inject web3 to website

And then we can use this command to run
```bash
npm install webpack -g
npm i
truffle networks --clean
truffle build
truffle migrate
webpack
npm run dev
```

And after that we can use our web application on [this](http://localhost:8080)

# review/modify guide of this code (Chinese)

该合约采用0.4.24版本编译,编译时无error和warning.

最为核心为[/app/scripts/app.js](/app/scripts/app.js),此代码注释已经写好


