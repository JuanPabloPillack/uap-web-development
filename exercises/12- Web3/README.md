# Ejercicio 12: Aplicación React Web3 con Faucet Token

## Descripción del Proyecto:

Desarrollar una aplicación web React que se conecte a la blockchain de Ethereum Sepolia para interactuar con un smart contract de FaucetToken. Los estudiantes aprenderán a integrar Web3 en aplicaciones React y manejar transacciones blockchain.

## Características Principales:

**Requisitos Obligatorios:**

1. **Conexión de Wallet**: Permitir conectar MetaMask u otra wallet EVM compatible
2. **Verificación de Estado**: Mostrar si el usuario ya reclamó tokens del faucet
3. **Reclamar Tokens**: Permitir al usuario reclamar tokens (una vez por dirección)
4. **Lista de Usuarios**: Mostrar direcciones que ya interactuaron con el faucet
5. **Información del Token**: Mostrar balance del usuario y datos del contrato

## Smart Contract: FaucetToken

El contrato ya está desplegado y cuenta con las siguientes funciones principales:

**Funciones del Faucet:**

- `claimTokens()`: Permite reclamar 1,000,000 tokens (una vez por dirección)
- `hasAddressClaimed(address)`: Verifica si una dirección ya reclamó tokens
- `getFaucetUsers()`: Retorna array de direcciones que interactuaron con el faucet
- `getFaucetAmount()`: Retorna la cantidad de tokens por reclamo

**Funciones ERC20 relevantes:**

- `balanceOf(address)`: Retorna el balance de tokens de una dirección
- `transfer(address to, uint256 amount)`: Transfiere tokens a otra dirección
- `approve(address spender, uint256 amount)`: Aprueba que otra dirección gaste tokens
- `allowance(address owner, address spender)`: Verifica cuántos tokens puede gastar una dirección

## Tecnologías Recomendadas:

### Librería Principal: **Wagmi + Viem**

**Wagmi** es la librería más popular y robusta para desarrollar dApps en React:

- **Ventajas:**
  - Hooks de React optimizados para Web3
  - Manejo automático de conexiones y estados
  - Soporte completo para TypeScript
  - Integración perfecta con WalletConnect y MetaMask
  - Manejo eficiente de cache y estados

### Configuración de Wallet: **Web3Modal v3**

- Interfaz de usuario profesional para conexión de wallets
- Soporte para múltiples wallets (MetaMask, WalletConnect, etc.)
- Configuración simplificada

### 3. Manejo de Estados y Errores:

- **Estados de carga**: Mostrar spinners durante transacciones
- **Errores**: Manejar errores de red, wallet, y contratos
- **Feedback**: Confirmaciones de transacciones exitosas
- **Validaciones**: Verificar que el usuario puede reclamar tokens

## Red de Prueba:

**Usar Sepolia Testnet:**

- **Chain ID**: 11155111
- **RPC URL**: https://ethereum-sepolia-rpc.publicnode.com
- **Faucet para ETH**: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- **Contrato**: https://sepolia.etherscan.io/address/0x3e2117c19a921507ead57494bbf29032f33c7412#code

## Recursos Adicionales:

- **Wagmi Docs**: https://wagmi.sh/
- **Web3Modal**: https://docs.walletconnect.com/web3modal/about
- **Viem**: https://viem.sh/
- **Ethereum Docs**: https://ethereum.org/en/developers/
- **OpenZeppelin**: https://docs.openzeppelin.com/

## Consejos:

- Comenzar con la configuración básica de Wagmi y Web3Modal
- Manejar todos los estados posibles (conectando, desconectado, error)
- Usar TypeScript para mejor experiencia de desarrollo
- Implementar manejo de errores robusto
- Considerar UX/UI para usuarios no familiarizados con Web3
