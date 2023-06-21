<h1 align="center">
  <img width="256px" src="https://github.com/VitorValandro/insignia/assets/50156875/42204ef5-da58-4b94-b731-a9d4d5c4fdd4" />
  <br />
</h1>

<h3 align="center">
 Um serviço de assinaturas digitais simples e seguro
</h3>

O Ínsignia permite que usuários compartilhem documentos entre si para assiná-los digitalmente de forma rápida e segura. Acesse agora: https://ufsc-insignia.vercel.app/auth

<div align="center">
  <div align="center">
    <img width="400" src="https://github.com/VitorValandro/insignia/assets/50156875/eb84666b-3fa7-4d2a-a9c2-7dc78877cda2">
    <img width="400" src="https://github.com/VitorValandro/insignia/assets/50156875/26cdbc68-bce8-43a8-8a7c-aba6497c0466">
    <img width="400" src="https://github.com/VitorValandro/insignia/assets/50156875/07af64b5-08a8-4642-8f0b-a88810df2eba">
    <img width="400" src="https://github.com/VitorValandro/insignia/assets/50156875/3ce1fc2a-d1c3-476b-a63b-237437a9d61d">
    <img width="400" src="https://github.com/VitorValandro/insignia/assets/50156875/47a8290d-bf76-4143-8499-d81b72b577ef">
    <img width="400" src="https://github.com/VitorValandro/insignia/assets/50156875/93f82567-38e9-4420-8e60-e985d14b9c93">
  </div>
  
</div>

## Sobre o projeto

A ideia desse projeto era principalmente entender como blockchains funcionam de modo prático, além de aprofundar os conhecimentos em desenvolvimento web. O projeto foi desenvolvido por mim como trabalho da disciplina INE5646-03238 do curso de Sistemas de Informação da UFSC.

### Funcionalidades

- Fluxo de criação de usuários com autenticação baseada em JWT;
- Upload de imagens para serem usadas como assinaturas;
- Upload de documentos PDF;
- Permite adicionar outros usuários do sistema como signatários;
- Número de assinaturas ilimitado, em qualquer página e posição do documento PDF;
- Assinatura digital de documentos PDF usando criptografia assimétrica;
- Além da criptografia assimétrica, a integridade do documento é garantida de forma descentralizada por meio da tecnologia de blockchain;
- Permite validar as assinaturas de um documento e garantir sua imutabilidade via blockchain;

## Aspectos técnicos

O Ínsignia foi feito baseado em três módulos:

- uma API RESTFul backend feita com Express.js integrada à um banco de dados relacional postgresql;
- um cliente web frontend implementado usando Next.js;
- um protótipo de blockchain independente da plataforma Insíginia que foi implementado usando Express.js, um banco de dados NoSQL MongoDB e é externalizada via API RESTFul;
  Todo o código foi feito usando TypeScript.

Cada módulo está descrito em detalhes abaixo, com instruções para rodar cada um dos módulos. O Insígnia funciona perfeitamente sem precisar estar conectado à blockchain, mas evidentemente os recursos de validação descentralizada da integridade do documento estarão desabilitados.

### Backend

O backend consiste em uma API RESTFul desenvolvida em Node.js, com Express.js e Prisma como interface para o banco de dados relacional postgresql. A maioria das rotas é protegida por autenticação JWT.

Para executar o backend, além de ter o Node.js na versão 18+ é necessário configurar um _storage_ e um banco de dados postgresql.

#### Storage

O Insígnia comporta upload de imagens e arquivos e, por isso, precisa de um storage externo onde essas informações são usadas. Para esse projeto decidi usar o serviço MEGA, que é gratuito. As credenciais de acesso à conta MEGA devem ser preenchidas nas variáveis de ambiente `STORAGE_EMAIL` e `STORAGE_PASSWORD` do arquivo `.env`. Essa é a única configuração necessária.

Como alternativa, há um `storage` local usando o sistema de arquivos do próprio servidor. Esse também já está configurado e com lógica escrita no `LocalStorageProvider` do arquivo `storage.provider.ts`, mas está sem integração com o front porque a API não escrevi uma rota para servir arquivos estáticos já que seria necessário, esse storage é apenas para testes. É possível usar qualquer outro storage, basta escrever um novo provider que respeite a interface `StorageProvider` com as funcionalidades para save, download e delete de arquivos.

#### Banco de Dados

O Insígnia precisa de um banco de dados postgresql rodando para funcionar corretamente. Há um arquivo para criar um container postgresql já configurado via `docker-compose` no projeto. O arquivo está na raiz do diretório da api e se chama `dev-database-config.docker.yml`. Para subir esse container basta ter o docker e docker-compose instalados e executar o script `start-dev-db.sh` dentro da pasta `scripts` da raiz desse mesmo diretório. O arquivo `.env.example` já traz o endereço de acesso `DATABASE_URL` correto para esse container, então nenhuma outra configuração é necessária.

Caso prefira configurar um banco de outra maneira, basta apontar o endereço de acesso na variável de ambiente `DATABASE_URL` do arquivo `.env`.

Depois que o banco estiver rodando, é preciso rodar as migrations para criar a estrutura do banco:

```bash
npx prisma migrate dev
```

#### Outras variáveis de ambiente

Leia com atenção os comentários do arquivo `.env.example` além do storage e do banco, também é preciso configurar o segredo JWT da aplicação e o endereço de qualquer nó da rede blockchain a partir do qual serão feitas as operações com toda a corrente.

#### Rodando a API

Com tudo configurado basta instalar os pacotes e executar a aplicação:

```bash
# instala os pacotes
$ npm run install

# roda em modo dev
$ npm run start:dev
```

### Frontend

O frontend da plataforma Insígnia foi feito usando Next.js e tailwindcss.

A única configuração necessária é a alteração do arquivo `.env.local` inserindo o endereço de acesso à API.

Para executar o cliente, basta instalar as dependências e iniciar a aplicação:

```bash
# instala os pacotes
$ npm run install

# roda em modo dev
$ npm run dev
```

### Blockchain

A blockchain que desenvolvi foi feita do zero, então é um protótipo que atende apenas os requisitos básicos para ser considerada uma blockchain. O Insígnia irá funcionar corretamente sem a blockchain, mas com a blockchain os documentos assinados são guardados em transações imutáveis que garantem a autenticidade e integridade do documento e das assinaturas. Ela foi desenvolvida usando Express.js e Prisma para interface com um banco mongodb.

Antes de subir a blockchain, leia o código para entender como montar uma rede de nós. Todas as rotas e funções estão documentadas. Após isso, para cada nó é necessário subir um banco mongodb independente (é possível compartilhar o banco entre os nós, mas desse modo a blockchain perde seu propósito).

#### Configuração do banco de dados

Assim como a API, o banco mongodb também pode ser configurado usando `docker-compose` através do script `start-blockchain-db.sh` que está dentro da pasta `scripts` na raiz do diretório desse módulo. Uma vez configurado, basta checar o endereço de acesso da variável de ambiente `DATABASE_URL` no arquivo `.env` desse módulo. Ao rodar múltiplos nós, lembre-se também de alterar a porta de acesso ao banco e à aplicação.

Com o banco rodando é necessário gerar o cliente do prisma e executar uma `seeding` que escrevi para popular a corrente com o bloco matriz:

```bash
# gera o cliente prisma
$ npx prisma generate

# popula o banco com o primeiro bloco
$ npx prisma db seed
```

Ao configurar um novo nó depois que a blockchain já tenha dados em outros nós não se preocupe, assim que o nó for adicionado à rede ele terá os dados sincronizados. O algortimo de conseso implementado também garante que todos os bancos estejam sincronizados com a corrente autêntica.

#### Rodando um nó

Depois que o banco estiver configurado, basta instalar os pacotes e iniciar a aplicação:

```bash
# instala os pacotes
$ npm run install

# faz o build do código
$ npm run build

# roda o nó
$ npm run start
```

Para conectar vários nós em uma rede use as rotas `/register-node` ou `/register-multiple-nodes`. Mais detalhes podem ser encontrados nos comentários do código.

### Considerações finais

O objetivo era aprender os conceitos básicos de blockchain e desenvolver uma blockchain independente a partir do zero. Esse objetivo foi cumprido. Também consegui aprender bastante coisa sobre criptografia assimétrica, assinaturas digitais e especificações avançadas de arquivos PDF. O resultado final me agrada bastante, é um serviço de assinatura 100% funcional que pode ser usado em praticamente qualquer cenário. É um MVP e ainda há bastante espaço para melhorias, mas gostei bastante do resultado em relação ao tempo investido.
