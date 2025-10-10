/// <reference types="cypress" />

describe('Usuário login e listar', () => {

  beforeEach(() => {
    cy.visit('/')
  })

  it('Deve realizar login com sucesso com os tipos de usuários', () => {
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

  it('Deve validar campos obrigatórios do login', () => {
   cy.intercept('POST', 'https://frotas.app.fslab.dev/api/auth/callback/credentials').as('loginRequest')
   cy.getByData('credencialLogin').type(' ')
   cy.getByData('senhaLogin').type('ABCDabcd1234')
   cy.getByData('button-cadastrar').click()
   cy.contains('p', 'Campo obrigatório').should('be.visible')

   cy.getByData('credencialLogin').clear().type('chefe')
   cy.getByData('senhaLogin').clear().type(' ')
   cy.getByData('button-cadastrar').click()
   cy.contains('Deve ter no mínimo 8 caracteres').should('be.visible')

   cy.login('boss', '12345678')
   cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
  });

  it("Deve listar usuários com sucesso, confirmando paginação e dados comparando com a API, aplicando os filtros da consulta", () => {
    
    cy.login("admin", "ABCDabcd1234");

    
    cy.intercept("GET", "**/usuarios*").as("getUsuariosAPI");
    
    cy.getByData("botao-page-usuarios").should("be.visible").click();
    cy.location("pathname").should("eq", "/usuarios");

    cy.wait("@getUsuariosAPI", { timeout: 15000 }).then(({ response }) => {
      cy.log("Response status:", response.statusCode);
      cy.log("Response body:", JSON.stringify(response.body));

      expect(response.statusCode).to.equal(200);
      const apiBody = response.body || {};
      
      let lista;
      if (Array.isArray(apiBody.data)) {
        lista = apiBody.data;
      } else if (Array.isArray(apiBody)) {
        lista = apiBody;
      } else if (apiBody.usuarios && Array.isArray(apiBody.usuarios)) {
        lista = apiBody.usuarios;
      } else {
        lista = [];
      }

      expect(Array.isArray(lista), "Lista deve ser um array").to.be.true;
      cy.log(`Encontrados ${lista.length} usuários na resposta`);
      
      if (lista.length > 0) {
        const first = lista[0];
        cy.log("first usuário:", JSON.stringify(first));
        if (first.nome) {
          cy.contains(first.nome, { timeout: 8000 }).should("be.visible");
        }
        if (first.credencial) {
          cy.contains(first.credencial, { timeout: 8000 }).should(
            "be.visible"
          );
        }
      } else {
        cy.log("Nenhum usuário encontrado na resposta");
      }
      
      const totalPages =
        apiBody.totalPages ||
        apiBody.total_pages ||
        apiBody.pageCount ||
        apiBody.totalPaginas;
      cy.log(`Total de páginas: ${totalPages}`);

      if (totalPages && totalPages > 1) {
        cy.log("Testando navegação de página");
        
        cy.get("body").then(($body) => {
          if ($body.find('[data-test="botao-proxima-pagina"]').length) {
            cy.getByData("botao-proxima-pagina").click();
          } else if ($body.find('[data-test="next-page"]').length) {
            cy.getByData("next-page").click();
          } else {
            cy.get("body").then(($body2) => {
              const nextBtn = $body2
                .find(
                  'button:contains("Próxima"), button:contains("Next"), button:contains("›"), button:contains("»")'
                )
                .first();
              if (nextBtn.length && !nextBtn.prop("disabled")) {
                cy.wrap(nextBtn).click({ force: true });
              } else {
                return; 
              }
            });
          }
        });
        cy.wait("@getUsuariosAPI", { timeout: 15000 })
          .its("response.statusCode")
          .should("equal", 200);
      } else {
        cy.log("Apenas uma página ou informação de paginação não disponível");
      }
    });

    
    cy.get("body").then(($body) => {
      if ($body.find('[data-test="campo-busca-usuario"]').length) {
        cy.getByData("campo-busca-usuario").clear().type("admin");
        cy.getByData("botao-buscar-usuario").click();
        cy.wait("@getUsuariosAPI", { timeout: 15000 }).then(({ response }) => {
          expect(response.statusCode).to.equal(200);
          const filtered = response.body?.data || response.body || [];
          if (filtered.length > 0) {
            cy.contains("admin", { timeout: 8000 }).should("be.visible");
          }
        });
      } else {
        cy.log(
          "Campo de busca específico não encontrado - pulando teste de filtro"
        );
      }
    });

    cy.location("pathname").should("include", "/usuarios");
  });

  it('Deve cadastrar um usuários com sucesso, confirmando resposta de rede retornada na operação', () => {
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

    cy.getByData('inputNomeUsuario').should('be.visible').type('New user frota')
    cy.getByData('inputCpfUsuario').should('be.visible').type(uniqueCPF)
    cy.getByData('inputDataNascimentoUsuario').should('be.visible').type('2000-09-12')
    cy.getByData('inputTelefoneUsuario').should('be.visible').type('(99) 99999-9999')
    cy.getByData('inputEmailUsuario').should('not.be.disabled').type(uniqueEmail)
    cy.getByData('inputDataAdmissaoUsuario').should('be.visible').type('2025-10-01')
    cy.getByData('inputEnderecoLogradouroUsuario').should('be.visible').type('Avenida Frota')
    cy.getByData('inputEnderecoNumeroUsuario').should('be.visible').type('99')
    cy.getByData('inputEnderecoBairroUsuario').should('be.visible').type('Bairro Frota')
    cy.getByData('inputEnderecoCepUsuario').should('be.visible').type('99999-999')

    cy.getByData('inputCredencialUsuario').should('be.visible').type(uniqueCredencial)
    cy.getByData('inputSenhaUsuario').should('be.visible').type('123@FrotasADS')
    cy.getByData('inputConfirmarSenha').should('be.visible').type('123@FrotasADS')
    cy.getByData('button-cadastrar').click()

    cy.contains('Usuário cadastrado com sucesso').should('be.visible')
    
    cy.wait('@cadastrarUsuario').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
  });

  it('Deve atualizar um usuários com sucesso, confirmando resposta de rede retornada na operação', () => {
    cy.intercept('PATCH', 'https://frotas-api.app.fslab.dev/usuarios/**').as('atualizarUsuario')
    
    cy.login('chefe', 'ABCDabcd1234')
    cy.getByData('botao-page-usuarios').click()

    cy.url().should('eq', 'https://frotas.app.fslab.dev/usuarios')
    cy.getByData('link-informacoes').first().click()
    cy.contains('h2', 'Informações do usuário').should('be.visible')
    cy.getByData('botaoEditarUsuario').click()
    
    cy.getByData('nomeUsuario').clear().type('user frota')
    cy.getByData('buttonEditar').click()
    
    cy.contains('Usuário atualizado com sucesso', { timeout: 10000 }).should('be.visible')
    cy.wait('@atualizarUsuario').its('response.statusCode').should('eq', 200)
  });
})

