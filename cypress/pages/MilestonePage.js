/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from '../integration/util'

class MilestonePage {

  createMilestone(title) {
    cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyCreateMilestone');
    cy.get('table[data-container="milestones"]').first().as('openMilestones')
    clickOn('button.add-issue-carat');
    clickOn('a[data-component="new-milestone-controls"]');
    setTextOn('input.milestone-title', 'Test Milestone ' + title)
    cy.get('div.dr-input div div').first().click()
    cy.get('ul.dr-day-list li[class="dr-day"]').first().click();
    cy.get('ul.dr-day-list').children().should('have.length', 0)
    cy.get('div.dr-input div div').last().click()
    cy.get('ul.dr-day-list li[class="dr-day"]').contains('28').last().click();
    clickOn('input.milestone-submit');
    cy.wait('@verifyCreateMilestone');
    cy.get('div.flash-tab-container div').last().should('contain', 'Milestone created')
    cy.get('@openMilestones').within(() => {
      cy.get('tr[data-item="milestone"] td.col-milestone').last().should("contain", title)
      const date = Cypress.moment().format('MMMM') + ' 28, ' + Cypress.moment().format('YYYY');
      cy.get('tr[data-item="milestone"] td.col-due-on').last().should("contain", date)
    })
  }
  closeMilestone(title) {
    cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyMilestoneView');
    cy.get('table[data-container="milestones"]').first().as('openMilestones')
    cy.get('table[data-container="milestones"]').last().as('closeMilestones')
    cy.get('@openMilestones').within(() => {
      cy.get('td.col-milestone a').contains(title).parent().siblings('td.col-settings').click();
      cy.xpath('//a[@aria-expanded="true"]//following::div//a[@data-behavior="transition"]').eq(0).click();
      cy.wait('@verifyMilestoneView')
    })
    cy.get('@openMilestones').within(() => {
      cy.get('td.col-milestone a').should('not.contain', title);
    })
    cy.get('@closeMilestones').within(() => {
      cy.get('td.col-milestone a').should('contain', title);
    })
  }

  deleteMilestone(title) {
    cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyMilestoneView');
    cy.get('table[data-container="milestones"]').first().as('openMilestones')
    cy.get('@openMilestones').within(() => {
      cy.get('td.col-milestone a').contains(title).parent().siblings('td.col-settings').click();
      cy.xpath('//a[@aria-expanded="true"]//following::div//a[@data-behavior="delete"]').eq(0).click();
      cy.wait('@verifyMilestoneView')
    })
    cy.get('@openMilestones').within(() => {
      cy.get('td.col-milestone a').should('not.contain', title);
    })
  }
}

module.exports = MilestonePage;
