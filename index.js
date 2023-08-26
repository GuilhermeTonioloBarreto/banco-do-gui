const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')

// funcao inicial executada toda vez que inicializa o sistema
function operacaoInicial(){

  inquirer.prompt([
    {
      type: 'list',
      name: 'acao',
      message: 'Bem vindo ao banco do gui. O que deseja fazer?',
      choices: [
        'Criar conta',
        'Saldo da conta',
        'Depositar dinheiro',
        'Sacar dinheiro',
        'Excluir dinheiro',
        'Acesso root',
        'Sair'
      ]
    }
  ])
  .then((resposta) => {
    const acao = resposta['acao']
    switch(acao){
      case 'Criar conta':
        checarNomeECriarSenha()
        break
      case 'Saldo da conta':
        checarNomeESenhaDaConta('saldo')
        break
      case 'Depositar dinheiro':
        checarNomeESenhaDaConta('deposito')
        break
      case 'Sacar dinheiro':
        console.log('sacar')
        break
      case 'Excluir dinheiro':
        console.log('Excluir')
        break
      case 'Acesso root':
        console.log('Root')
        break
      case 'Sair':
        process.exit()
        break
    }
  })
  .catch((error) => {
    console.log(error)
  })

}

// ------------------------------------------------------
// criação de conta

// funcao que cria a conta
function checarNomeECriarSenha(){
  inquirer.prompt([
  {
    name: 'nomeDaConta',
    message: 'Digite o nome da conta que deseja criar:'
  }
  ])
  .then(resposta => {
    const nomeDaConta = resposta['nomeDaConta']

    // checar se existe uma conta com o mesmo nome
    if(checarExistentaDaConta(nomeDaConta)){
      console.log(chalk.bgRed.black('Este nome de conta já existe \n'))
      operacaoInicial()
      return 
    }

    inquirer.prompt([
      {
        name: 'senhaDaConta',
        type: 'password',
        mask: '*',
        message: 'Crie a senha da sua conta:'
      }
    ])
    .then(resposta => {
      const senhaDaConta = resposta['senhaDaConta']
      
      // objeto que cria a conta
      const contaCriada = {
        nomeDaConta: nomeDaConta,
        senhaDaConta: senhaDaConta,
        saldo: 0
      }

      // criar conta
      const fb = criarConta(nomeDaConta, contaCriada)

      if(fb){
        console.log(chalk.bgGreen.black(`A conta foi criada! \n`))
        operacaoInicial()
        return  
      } else{
        console.log(chalk.bgRed.black(`Houve um erro na criação de sua conta \n`))
        operacaoInicial()
        return
      }
      
    })
    .catch(error => {
      console.log(error)
    })
  })
  .catch(error => {
    console.log(error)
  })
}

// ------------------------------------------------------

// verifica se a conta existe e se a senha está correta
function checarNomeESenhaDaConta(acaoFutura){

  // pergunta o nome da conta
  inquirer.prompt([
    {
      name: 'nomeDaConta',
      message: 'Digite o nome da conta:'
    }
  ])
  .then(resposta => {
    const nomeDaConta = resposta['nomeDaConta']
    
    if(!checarExistentaDaConta(nomeDaConta)){
      console.log(chalk.bgRed.black('Nome da conta não existe\n'))
      operacaoInicial()
      return false
    }

    // pergunta a senha da conta
    inquirer.prompt([
      {
        name: 'senhaDaConta',
        type: 'password',
        mask: '*',
        message: 'Digite a senha da conta:'
      }
    ])
    .then(res => {
      const senhaDaConta = res['senhaDaConta']
      
      // checar se a senha da conta esta correta
      if(senhaDaConta !== pegarSenhaDaConta(nomeDaConta)){
        console.log(chalk.bgRed.black('A senha digitada está incorreta\n'))
        operacaoInicial()
        return false
      }

      // uma vez que a conta existe e a senha está correta
      // a operacao é realizada de acordo com a selecao previa do usuario
      switch(acaoFutura){
        case 'saldo':
          saldoDaConta(nomeDaConta)
          break
        case 'deposito':
          depositoNaConta(nomeDaConta)
          break
      }

    })
    .catch(err => console.log(err))

  })
  .catch(err => console.log(err))

}


// ------------------------------------------------------
// verifica o saldo da conta
function saldoDaConta(nomeDaConta){

  const saldoDaConta = pegarSaldoDaConta(nomeDaConta)
  
  console.log(chalk.bgBlue.black(`O saldo da conta é de R$ ${saldoDaConta}\n`))
  operacaoInicial()
  return
  
}

// ------------------------------------------------------
// faz depósito na conta
function depositoNaConta(nomeDaConta){
  
  // verificar o valor para depósito
  inquirer.prompt([
    {
      name: 'valorDoDeposito',
      message: 'Digite o valor do depósito:'
    }
  ])
  .then(res => {
    const valorDoDeposito = res['valorDoDeposito']

    // checar se o usuario digitou de fato um numero
    if(!valorDoDeposito || isNaN(valorDoDeposito)){
      console.log(chalk.bgRed.black('Valor incorreto\n'))
      operacaoInicial()
      return
    }

    let dadosDaConta = pegarDadosDaConta(nomeDaConta)
    dadosDaConta.saldo = parseFloat(valorDoDeposito) + parseFloat(dadosDaConta.saldo)

    // sobrescrever conta com dados atualizados
    const fb = criarConta(nomeDaConta, dadosDaConta)

    if(fb){
      console.log(chalk.bgGreen.black(`O depósito de R$ ${valorDoDeposito} foi realizado!\n`))
      operacaoInicial()
      return
    } else {
      console.log(chalk.bgRed.black(`Houve um erro na realização do depósito\n`))
      operacaoInicial()
      return
    }

  })
  .catch(err => console.log(err))
  
}


// ------------------------------------------------------

// ------------------------------------------------------

// ------------------------------------------------------

// ------------------------------------------------------

// ------------------------------------------------------
// funçoes comuns ao programa

// checa a existência da conta
function checarExistentaDaConta(nomeDaConta){
  // retorna true se a conta existe
  if(fs.existsSync(`./contas/${nomeDaConta}.json`)){
    return true
  }

  return false
}

// pegar senha da conta
function pegarSenhaDaConta(nomeDaConta){
  const dadosDaConta = JSON.parse(fs.readFileSync(`./contas/${nomeDaConta}.json`, { encoding: 'utf8', flag: 'r' }))
  return dadosDaConta.senhaDaConta
}

// pegar saldo da conta
function pegarSaldoDaConta(nomeDaConta){
  const dadosDaConta = JSON.parse(fs.readFileSync(`./contas/${nomeDaConta}.json`, { encoding: 'utf8', flag: 'r' }))
  return dadosDaConta.saldo
}

// pegar todos os dados da conta
function pegarDadosDaConta(nomeDaConta){
  const dadosDaConta = JSON.parse(fs.readFileSync(`./contas/${nomeDaConta}.json`, { encoding: 'utf8', flag: 'r' }))
  return dadosDaConta
}

// criar conta
function criarConta(nomeDaConta, dadosDaConta){

  // cria um arquivo (se o arquivo já existir, ele é substituído)
  fs.writeFileSync(`./contas/${nomeDaConta}.json`, JSON.stringify(dadosDaConta), error => {
    console.log(error)
    return false
  })

  return true

}
// ------------------------------------------------------




operacaoInicial()