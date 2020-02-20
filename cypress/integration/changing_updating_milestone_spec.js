/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from './util'
const MilestonePage = new (require('../pages/MilestonePage'))();

describe('Codetree : Changing, Updateing And Deleting Milestones functionality Tests', () => {
    var random = randomString(4);
    var user;
    context('At Open Milestone Window', () => {
        before(function () {
            cy.fixture('users.json').as('usersData');
            cy.get('@usersData').then((users) => {
                user = users.grp1Collaborator;
            })
        })

        beforeEach(function () {
            cy.server();
            sidestep_login(user.publicId);
            cy.get('.sidebar').should('be.visible');
            clickOn('//span[contains(text(),"Milestones")]')
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones')

            cy.route('GET', '/projects/*/milestones').as('verifyMilestone');
            cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyMilestoneView');
            cy.route("GET", '/projects/*/cards/*?filter={"type":"epic"}').as('verifyEpic');
            cy.route("GET", '/projects/*/board?type=epic&_pjax=[data-pjax-container]').as('addEpics');
            cy.route('POST', '/projects/*/issues').as('createIssue');
            cy.get('table[data-container="milestones"]').first().as('openMilestones')
        })

        it('verify created milestone have hamburger, setting, progress bar, due date and View Task Board CHGMIL_001', () => {
            MilestonePage.createMilestone(random);
            cy.get('th.group-header').should(($th) => {
                expect($th.first().text(), 'Hearder : Open Milestones').to.contains('Open Milestones');
                expect($th.last().text(), 'Hearder : Closed Milestones').to.contains('Closed Milestones');
            });
            cy.get('tr[data-item="milestone"]').within(() => {
                cy.get('td.col-handle').should('be.visible');
                cy.get('td.col-settings').should('be.visible');
                cy.get('td.col-due-on').should('be.visible');
                cy.get('div.progress-bar').should('be.visible');
                cy.get('td.col-controls').should('contain', 'View Task Board');
            });
        })

        it('verify created milestone move to top functionality', () => {
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.first().click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').first().should('contain', random);
            })
        })

        it('verify created milestone move to bottom functionality', () => {
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.eq(1).click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').last().should('contain', random);
            })
        })

        it('verify created milestone delete successfully', () => {
            MilestonePage.deleteMilestone(random);
        })

    })

    context.only('At Close Milestone Window', () => {
        //random ='mvjx';
        before(function () {
            cy.fixture('users.json').as('usersData');
            cy.get('@usersData').then((users) => {
                user = users.grp1Collaborator;
            })
        })

        beforeEach(function () {
            cy.server();
            sidestep_login(user.publicId);
            cy.get('.sidebar').should('be.visible');
            clickOn('//span[contains(text(),"Milestones")]')
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones')

            cy.route('GET', '/projects/*/milestones').as('verifyMilestone');
            cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyMilestoneView');
            cy.route("GET", '/projects/*/cards/*?filter={"type":"epic"}').as('verifyEpic');
            cy.route("GET", '/projects/*/board?type=epic&_pjax=[data-pjax-container]').as('addEpics');
            cy.route('POST', '/projects/*/issues').as('createIssue');
            cy.get('table[data-container="milestones"]').last().as('closeMilestones')
        })

        it('verify closed milestone have hamburger, setting, progress bar, due date and View Task Board CHGMIL_001', () => {
            MilestonePage.createMilestone(random);
            MilestonePage.closeMilestone(random);
            cy.get('th.group-header').should(($th) => {
                expect($th.first().text(), 'Hearder : Open Milestones').to.contains('Open Milestones');
                expect($th.last().text(), 'Hearder : Closed Milestones').to.contains('Closed Milestones');
            });
            cy.get('tr[data-item="milestone"]').within(() => {
                cy.get('td.col-handle').should('be.visible');
                cy.get('td.col-due-on').should('be.visible');
                cy.get('div.progress-bar').should('be.visible');
                cy.get('td.col-controls').should('contain', 'View Task Board');
                cy.get('td.col-settings').should('be.visible');
            });
        })

        it('verify closed milestone move to bottom functionality', () => {
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.eq(1).click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').last().should('contain', random);
            })
        })

        it.only('verify closed milestone move to top functionality', () => {
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.first().click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').first().should('contain', random);
            })
        })

        it('verify closed milestone delete successfully', () => {
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().nextAll('td.col-settings').click();
                cy.xpath('//a[@aria-expanded="true"]//following::div//a[@data-behavior="delete"]').eq(0).click();
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').should('not.contain', random);
            })
        })
    })
})