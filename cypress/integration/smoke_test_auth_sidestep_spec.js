/// <reference types="Cypress" />

import { sidestep_login } from './util'

context('Accessing Codetree, sidestepping authentication', () => {

  it('Pricing page accessible from home page', () => {
    cy.visit('/')
    cy.get('.menu-container').contains('Pricing').click()
    cy.location('pathname').should('include', 'pricing')
  })

  it('Authenticated access to project', () => {
    cy.fixture('users.json').as('usersData');
    cy.get('@usersData').then((users) => {
      sidestep_login(users.grp1Collaborator.publicId);
      cy.get('.sidebar').should('be.visible');
      cy.location('pathname').should('include', 'projects/' + users.grp1Collaborator.projectId)
    })

  })
})
