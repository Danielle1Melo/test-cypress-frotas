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

})