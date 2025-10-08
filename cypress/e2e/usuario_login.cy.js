/// <reference types="cypress" />

describe('Usuário login e listar', () => {

  beforeEach(() => {
    cy.visit('/')
  })

  it.skip('Deve realizar login com sucesso com os tipos de usuários', () => {
    const users = ['usuario', 'motorista', 'mecanico', 'chefe', 'secretario', 'admin']
    cy.intercept('POST','https://frotas.app.fslab.dev/api/auth/callback/credentials').as('loginRequest')
    for (let user in users) {
    cy.login(users[user], 'ABCDabcd1234')
    
    cy.url().should('eq', 'https://frotas.app.fslab.dev/inicio')
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.location('pathname').should('eq', '/inicio')
    cy.getByData('side-bar-header-perfil').click()
    cy.contains('a', 'Perfil').should('be.visible')
    cy.get('a').contains('Sair').click()
    }
  })

  it.skip('Deve validar campos obrigatórios do login', () => {
   cy.intercept('POST', 'https://frotas.app.fslab.dev/api/auth/callback/credentials').as('loginRequest')
   cy.getByData('credencialLogin').type(' ')
   cy.getByData('senhaLogin').type('ABCDabcd1234')
   cy.getByData('button-cadastrar').click()
   cy.contains('p', 'Campo obrigatório').should('be.visible')

   cy.getByData('credencialLogin').clear().type('chefe')
   cy.getByData('senhaLogin').clear().type(' ')
   cy.getByData('button-cadastrar').click()
   //cy.contains('Deve ter no mínimo 8 caracteres').should('be.visible')

   cy.login('boss', '12345678')
   cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
  });

  it('Deve listar usuários com sucesso, confirmando paginação e dados comparando com a API, aplicando os filtros da consulta', () => {
    cy.login('chefe', 'ABCDabcd1234')

    let authToken = null
    cy.request({
      method
    })

    
    cy.intercept('GET', '**/api/usuarios**').as(listarUsuarios)

    cy.getByData('botao-page-usuarios').click()
    cy.url().should('eq', 'https://frotas.app.fslab.dev/usuarios')
    cy.getByData('inputNomeUsuario').type('New user frota')
    cy.getByData('botao-filtrar').click();
  });

  it.skip('Deve cadastrar um usuários com sucesso, confirmando resposta de rede retornada na operação', () => {
    cy.login('chefe', 'ABCDabcd1234')
    cy.getByData('botao-page-usuarios').click()
    cy.url().should('eq', 'https://frotas.app.fslab.dev/usuarios')
    cy.contains('h1', 'Usuários').should('be.visible')
    cy.getByData('novoUsuarioButton').click()
    cy.url().should('eq', 'https://frotas.app.fslab.dev/usuarios/cadastrar')
    cy.contains('h1', 'Cadastrar usuário').should('be.visible')

    cy.intercept('POST', '/usuarios/cadastrar').as('cadastrarUsuario')

    function generateCPF() {
      const numeros = Array(9).fill(0).map(() => Math.floor(Math.random() * 9));
      
      const calcDV = (base) => {
        const resto = base.reduce((acc, num, i) => acc + num * (base.length + 1 - i), 0) % 11;
        return resto < 2 ? 0 : 11 - resto;
      };
    
      const dv1 = calcDV(numeros);
      const dv2 = calcDV([...numeros, dv1]);
      
      return [...numeros, dv1, dv2].join('').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function generateEmailUnique() {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `frota-${timestamp}${random}@test.com`;
    }

    function generateCredencial(){
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 6);
      return `frota${timestamp}${random}`;
    }

    const uniqueEmail = generateEmailUnique()
    const uniqueCPF = generateCPF()
    const uniqueCredencial = generateCredencial()

    cy.getByData('inputNomeUsuario').type('New user frota')
    cy.getByData('inputCpfUsuario').type(uniqueCPF)
    cy.getByData('inputDataNascimentoUsuario').type('2000-09-12')
    cy.getByData('inputTelefoneUsuario').type('(99) 99999-9999')
    cy.getByData('inputEmailUsuario').type(uniqueEmail)
    cy.getByData('inputDataAdmissaoUsuario').type('2025-10-01')
    cy.getByData('inputEnderecoLogradouroUsuario').type('Avenida Frota')
    cy.getByData('inputEnderecoNumeroUsuario').type('99')
    cy.getByData('inputEnderecoBairroUsuario').type('Bairro Frota')
    cy.getByData('inputEnderecoCepUsuario').type('99999-999')

    cy.getByData('inputCredencialUsuario').type(uniqueCredencial)
    cy.getByData('inputSenhaUsuario').type('123@FrotasADS')
    cy.getByData('inputConfirmarSenha').type('123@FrotasADS')
    cy.getByData('button-cadastrar').click()

    cy.contains('Usuário cadastrado com sucesso').should('be.visible')
    
    cy.wait('@cadastrarUsuario').then((interception) => {
      expect(interception.response.statusCode).should('eq', 200)
    })
  });

  it.skip('Deve atualizar um usuários com sucesso, confirmando resposta de rede retornada na operação', () => {
  });
})

