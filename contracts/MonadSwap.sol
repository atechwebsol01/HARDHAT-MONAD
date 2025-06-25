// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MonadSwap is Ownable(msg.sender), ReentrancyGuard {
    address public v2Router;
    address public universalRouter;
    address public wmonToken;
    address public defaultOutputToken;

    event SwapExecuted(
        address indexed tokenIn, 
        address indexed tokenOut, 
        uint256 amountIn, 
        uint256 amountOut
    );
    event SwapFailed(string reason);

    constructor(
        address _v2Router,
        address _universalRouter,
        address _wmonToken,
        address _defaultOutputToken
    ) {
        v2Router = _v2Router;
        universalRouter = _universalRouter;
        wmonToken = _wmonToken;
        defaultOutputToken = _defaultOutputToken;
    }

    function swapTokens(
        address router,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address recipient
    ) external nonReentrant {
        // Transfer tokens from sender to contract
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), 
            "Transfer of input tokens failed"
        );

        // Approve router to spend tokens
        require(
            IERC20(tokenIn).approve(router, amountIn), 
            "Token approval failed"
        );

        // Prepare path for swap
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        // Attempt swap with V2 router signature
        bytes memory payload = abi.encodeWithSignature(
            "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
            amountIn,
            amountOutMin,
            path,
            recipient,
            block.timestamp + 300
        );

        (bool success, bytes memory returnData) = router.call(payload);

        if (success) {
            uint256 amountOut = abi.decode(returnData, (uint256));
            emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut);
        } else {
            string memory errorMessage = returnData.length > 0 
                ? abi.decode(returnData, (string)) 
                : "Swap failed without specific error";
            
            emit SwapFailed(errorMessage);
            revert(errorMessage);
        }
    }

    // Fallback and receive functions
    receive() external payable {}
    fallback() external payable {}

    // Emergency token withdrawal
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    // Optional: Update router addresses
    function updateRouters(
        address _v2Router, 
        address _universalRouter
    ) external onlyOwner {
        v2Router = _v2Router;
        universalRouter = _universalRouter;
    }
}