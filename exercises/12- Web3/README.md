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

---

## Parte 2: Backend con Autenticación Web3

### Descripción Extendida:

Agregar un backend Node.js/Express que actúe como intermediario entre el frontend y la blockchain. Los usuarios deberán autenticarse usando "Sign-In with Ethereum" antes de poder interactuar con el smart contract a través del backend.

### Arquitectura de la Solución:

**Frontend React:**
- Ya no interactúa directamente con la blockchain
- Se conecta solo con el backend a través de APIs REST
- Mantiene la funcionalidad de conexión de wallet para autenticación

**Backend Express/Next/Otro:**
- Maneja la autenticación usando Sign-In with Ethereum (SIWE)
- Genera y valida JWT tokens
- Interactúa directamente con el smart contract
- Protege endpoints críticos con middleware de autenticación

### Nuevos Requisitos:

#### Backend API Endpoints:

1. **POST /auth/message**
   - Devuelve el mensaje a ser firmado.
   - Guardarlo de manera que se pueda leer en el signin
   - Respuesta: `{ token: string, address: string }`

2. **POST /auth/signin**
   - Recibe mensaje firmado de SIWE
   - Valida la firma
   - Genera JWT si la validación es exitosa
   - Respuesta: `{ token: string, address: string }`

3. **POST /faucet/claim** (Protegido)
   - Requiere JWT válido en headers
   - Extrae la dirección del token
   - Ejecuta `claimTokens()` en el smart contract
   - Respuesta: `{ txHash: string, success: boolean }`

4. **GET /faucet/status/:address** (Protegido)
   - Requiere JWT válido
   - Verifica si la dirección ya reclamó tokens
   - Consulta balance y datos del contrato
   - Respuesta: `{ hasClaimed: boolean, balance: string, users: string[] }`

#### Tecnologías para el Backend:

**Autenticación:**
- `siwe` - Sign-In with Ethereum
- `jsonwebtoken` - Manejo de JWT
- `ethers` o `viem` - Interacción con blockchain

**Framework:**
- `express` o `Next.js` u otro - Servidor web

#### Configuración de Seguridad:

**Variables de Entorno (.env):**
```
PRIVATE_KEY=your_private_key_here
JWT_SECRET=your_jwt_secret_here
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CONTRACT_ADDRESS=0x3e2117c19a921507ead57494bbf29032f33c7412
```

**Middleware de Autenticación:**
- Validar JWT en headers `Authorization: Bearer <token>`
- Extraer dirección de wallet del token
- Verificar que el token no haya expirado

#### Modificaciones en el Frontend:

**Cambios Principales:**
- Remover interacción directa con smart contract
- Implementar Sign-In with Ethereum
- Agregar manejo de JWT
- Crear servicio API para comunicación con backend
- Mantener UX similar pero con flujo de autenticación

**Nuevas Funcionalidades:**
- Modal de firma para autenticación
- Manejo de sesión con JWT
- Estados de loading para requests al backend
- Manejo de errores de autenticación

### Beneficios de esta Arquitectura:

1. **Seguridad**: Las claves privadas solo están en el backend
2. **Control**: El backend puede implementar rate limiting y validaciones
3. **Escalabilidad**: Posibilidad de agregar base de datos y lógica compleja
4. **Gastos de Gas**: El backend maneja los costos de gas

