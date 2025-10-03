/// <reference types="cypress" />

describe('Usuário login e listar', () => {

  beforeEach(() => {
    cy.visit('/')
  })

  it('Deve realizar login com sucesso com os tipos de usuários', () => {
    const users = ['usuario', 'motorista', 'mecanico', 'chefe', 'secretario', 'admin']
    cy.intercept('POST','https://frotas.app.fslab.dev/api/auth/callback/credentials').as('loginRequest')
    for (let user in users) {
    cy.getByData('credencialLogin').type(users[user])
    cy.getByData('senhaLogin').type('ABCDabcd1234')
    cy.getByData('button-cadastrar').click()
    cy.url().should('eq', 'https://frotas.app.fslab.dev/inicio')
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.location('pathname').should('eq', '/inicio')
    cy.getByData('side-bar-header-perfil').click()
    cy.contains('a', 'Perfil').should('be.visible')
    }
  })

  it('Deve validar campos obrigatórios do login', () => {
   cy.getByData('credencialLogin').type(' ')
   cy.getByData('senhaLogin').type('ABCDabcd1234')
   cy.getByData('button-cadastrar').click()
   cy.contains('p', 'Campo obrigatório').should('be.visible')

   cy.getByData('credencialLogin').type('chefe')
   cy.getByData('senhaLogin').type(' ')
   cy.getByData('button-cadastrar').click()
   //cy.contains('Deve ter no mínimo 8 caracteres').should('be.visible')

   cy.intercept('POST', 'https://frotas.app.fslab.dev/api/auth/callback/credentials').as('loginRequest')
   cy.getByData('credencialLogin').type('boss')
   cy.getByData('senhaLogin').type('12345678')
   cy.getByData('button-cadastrar').click()
   cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
  });

  it('Deve listar usuários com sucesso, confirmando paginação e dados comparando com a API, aplicando os filtros da consulta', () => {
    
  });

  it('Deve cadastrar um usuários com sucesso, confirmando resposta de rede retornada na operação', () => {
    cy.login('chefe', 'ABCDabcd1234')
    cy.getByData('botao-page-usuarios').click()
    cy.url().should('eq', 'https://frotas.app.fslab.dev/usuarios')
    cy.contains('h1', 'Usuários').should('be.visible')

    cy.getByData('novoUsuarioButton').click()
    cy.url().should('eq', 'https://frotas.app.fslab.dev/usuarios/cadastrar')
    cy.contains('h1', 'Cadastrar usuário').should('be.visible')

    cy.getByData('inputNomeUsuario').type('New user frota')
    cy.getByData('inputCpfUsuario').type('12345678901')
    cy.getByData('inputDataNascimentoUsuario').type('12/09/2000')
    cy.getByData('inputTelefoneUsuario').type('(99) 99999-9999')
    cy.getByData('inputEmailUsuario').type('newuser@frota.com')
    cy.getByData('inputEnderecoLogradouroUsuario').type('Avenida Frota')
    cy.getByData('inputEnderecoNumeroUsuario').type('99')
    cy.getByData('inputEnderecoBairroUsuario').type('Bairro Frota')
    cy.getByData('inputEnderecoCepUsuario').type('99999-999')

    cy.getByData('inputCredencialUsuario').type('123Frota')
    cy.getByData('inputSenhaUsuario').type('123frota')
    cy.getByData('inputConfirmarSenha').type('123frota')
  });


  it('Deve atualizar um usuários com sucesso, confirmando resposta de rede retornada na operação', () => {
    // Implementação use o cy.intercetp()
  });
})