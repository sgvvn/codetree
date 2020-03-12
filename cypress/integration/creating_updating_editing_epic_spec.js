/// <reference types="Cypress" />
import { randomString, clickOnElement, clickOn, setTextOn, sidestep_login } from './util'

const EpicPage = new (require('../pages/EpicPage'))();

describe('Codetree : Add Epics functionality Tests', () => {
  var random;
  var user;

  before(function () {
    cy.fixture('users.json').as('usersData');
    cy.get('@usersData').then((users) => {
      user = users.grp1Collaborator;
      random = randomString(4);
    })
  })

  after(function () {
    clickOn('//span[contains(text(),"Epics")]');
    cy.wait('@addEpics');

    cy.location().should((loc) => {
      expect(loc.search).to.eq('?type=epic')
      expect(loc.toString()).to.eq('https://staging.codetree.com/projects/'+user.projectId+'/board?type=epic')
    })
    cy.wait(300);
    cy.get('h3.board-card-title').contains(random).click();
    cy.get('span.issue-form-title').should('contain', random);
    cy.get('button.issue-form-status').should('contain', 'Open').click();
    clickOnElement('button.issue-form-command', 'last');
  })

  beforeEach(function () {
    cy.server();
    sidestep_login(user.publicId);
    cy.get('.sidebar').should('be.visible');
    cy.route('GET', '/projects/*/views?include_counts=true&scope=issues&view_type=boards').as('createissuewindow')
    cy.route("GET", '/projects/*/board?type=epic&_pjax=[data-pjax-container]').as('addEpics');
    clickOn('//span[contains(text(),"Epics")]');
    cy.wait('@addEpics');
    cy.get('div.issue-form-sidebar div.issue-form-sidebar-item').as('sidebar');
    cy.route('GET', '/projects/*/cards/*?filter={"type":"epic"}').as('verifyEpic')
    cy.route('GET', '/projects/*/issues/*/edit').as('verifyepicwindow')
  })

  it('verify all fields at add epics window CREPIC_001 CREPIC_002', () => {
    clickOn('button.add-issue-carat');
    cy.get('a[data-component="new-epic-controls"]').click();
    cy.wait(300);
    cy.get('#title').should('be.visible');
    cy.get('span.username').should('be.visible');
    cy.get('span[data-section="stage-title"]').then(($ele) => {
      expect($ele.text()).to.eq("Untriaged");
    })
    cy.get('div.octicon-wrapper .octicon').first().should('be.visible');
    cy.get('div[class="form-controls"] button').should('contain', "Create Epic");
    cy.get('@sidebar').eq(3).find('h3').should('contain', "Priority");
    cy.get('@sidebar').eq(3).find('div label span').should('contain', "Move to top");
    cy.get('@sidebar').eq(3).find('div').last().find('label span').should('contain', "Move to bottom");
    cy.get('@sidebar').eq(0).find('h3').should('contain', "Repository");
    cy.get('button.issue-form-command').last().click();
  })

  it('verify create epic functionality CREPIC_003', () => {
    EpicPage.createEpic(random);
  })

  it('verify create epic without title window validation CREPIC_004', () => {
    clickOn('button.add-issue-carat');
    clickOn('a[data-component="new-epic-controls"]');
    clickOn('button[data-behavior="create-issue"]');
    cy.get('div[class="issue-form-header"] div.in').should('contain', "Please enter an issue title")
    cy.get('button.issue-form-command').click();
  })

  it('verify add epic priority move from top to bottom CREPIC_005', () => {
    cy.get('div[data-id="backlog"] div h3.board-card-title').first().contains(random).click();
    cy.get('ul.issue-form-priority-list li button[data-behavior="move-bottom"]').should('contain', "Move to bottom").click();
    cy.get('button.issue-form-command').last().click();
    cy.wait('@verifyEpic')
    cy.get('div[data-id="backlog"] div h3.board-card-title').last().should('contain', random);
  })

  it('verify add epic priority from bottom to top CREPIC_006', () => {
    cy.get('div[data-id="backlog"] div h3.board-card-title').last().contains(random).click();
    cy.get('ul.issue-form-priority-list li button[data-behavior="move-top"]').should('contain', "Move to top").click();
    cy.get('button.issue-form-command').last().click();
    cy.wait('@verifyEpic')
    cy.get('div[data-id="backlog"] div h3.board-card-title').first().should('contain', random);

  })

  it('verify add epic to select milestone functionality #CREPIC_009', () => {
    cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
    cy.get('span.issue-form-title').should('contain', random);
    clickOnElement('a.issue-form-milestone-menu-toggle .octicon', "last");
    cy.get('.issue-form-milestone-menu .dropdown-menu .menu-item-filter .text-field').last().type('DND 1');
    cy.get('.issue-form-milestone-menu .dropdown-menu ul li.nav-focus').contains('DND 1').click();
    cy.get('a.issue-form-milestone-menu-toggle .title').should('contain', 'DND 1');
    clickOnElement('button.issue-form-command', 'last');
    cy.wait('@verifyEpic')
    cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('ul.issue-labels li').should('contain', 'DND 1');
  })

  it('verify add epic to select label functionality  #CREPIC_010', () => {
    cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
    cy.get('span.issue-form-title').should('contain', random);
    clickOnElement('div.octicon-wrapper .octicon', "last");
    cy.get('input[value="enhancement"]').last().click();
    cy.get('ul[class="issue-labels issue-form-labels"] li').should('contain', 'enhancement');
    clickOnElement('button.issue-form-command', 'last');
    cy.wait('@verifyEpic')
    cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('ul.issue-labels li').should('contain', 'enhancement');
  })

  it('verify add epic to select assigned user functionality #CREPIC_011', () => {
    cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
    cy.get('span.issue-form-title').should('contain', random);
    cy.get('a.assignees-gear-link').last().click();
    cy.get('span.username').last().should('contain', user.name).click()
    clickOnElement('button.issue-form-command', 'last');
    cy.wait('@verifyEpic')
    cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('span.board-card-assignee').should("have.attr", "data-original-title", "Assigned to " + user.name);
  })

  it('verify added epic to change stages from default to backlog CREPIC_007 ', () => {
    cy.get('div[data-id="backlog"] div h3.board-card-title').contains(random).click();
    cy.wait('@verifyepicwindow');
    cy.xpath('//a[@class="issue-form-stage-menu-toggle"]').last().click({ force: true });
    cy.xpath('//div[@class="issue-form-stage-menu open"]/div/ul/li[2]/label/input').click();
    cy.get('button.issue-form-command').last().click();
    cy.wait('@verifyEpic')
    cy.get('div[data-id="w8Uj"] div h3.board-card-title').contains(random).click();
    cy.wait('@verifyepicwindow');
    cy.xpath('//a[@class="issue-form-stage-menu-toggle"]').last().click({ force: true });
    cy.xpath('//div[@class="issue-form-stage-menu open"]/div/ul/li[2]/label/input').last().click();
    cy.get('button.issue-form-command').last().click();
  })

  it('verify added epic to change stages from default to inprogress CREPIC_008 ', () => {
    cy.get('div[data-id="backlog"] div h3.board-card-title').contains(random).click();
    cy.wait('@verifyepicwindow');
    cy.xpath('//a[@class="issue-form-stage-menu-toggle"]').last().click({ force: true });
    cy.xpath('//div[@class="issue-form-stage-menu open"]/div/ul/li[3]/label/input').click();
    cy.get('button.issue-form-command').last().click();
    cy.wait('@verifyEpic')
    cy.get('div[data-id="qh6H"] div h3.board-card-title').should('contain',random);
    // cy.wait('@verifyepicwindow');
    // cy.xpath('//a[@class="issue-form-stage-menu-toggle"]').last().click({ force: true });
    // cy.xpath('//div[@class="issue-form-stage-menu open"]/div/ul/li[2]/label/input').last().click();
    // cy.get('button.issue-form-command').last().click();
  })

  it('verify added issue in epic add issue functionality #CREPIC_012', () => {
    cy.contains('Add Issue').click();
    cy.wait(400);
    cy.get('#title').type("Test Issue " + random);
    cy.contains('Create Issue').click();
    cy.get('button.issue-form-command').click();
    cy.get('h3.board-card-title').contains(random).click();
    cy.get('span.issue-form-title').should('contain', random);
    cy.get('div.issue-form-references div #epic_issue_textcomplete').click();
    cy.get('div.issue-form-references div #epic_issue_textcomplete').type(random);
    cy.route('GET','/projects/*/issues/autocomplete_json.json?type=all&status=&per_page=20&page=1&keyword='+random).as('waitForAutocomplete')
    cy.wait('@waitForAutocomplete')
    cy.get('#edit_modal_epic_autocomplete_container ul li').first().click();
    cy.get('table[class="compact-table epic-issues"] tbody tr').first().find('td span').should('contain', random);
    clickOnElement('button.issue-form-command', 'last');
    cy.wait('@verifyEpic')
    cy.xpath('//a/span[contains(text(),"Issues")]').click();
    cy.wait('@createissuewindow');
   // cy.wait(400)
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/projects/' + user.projectId + '/board')
    })
    cy.get('h3.board-card-title').contains(random).click();
    cy.get('span.issue-form-title').should('contain', random);
    cy.get('button.issue-form-status').should('contain', 'Open').click();
    clickOnElement('button.issue-form-command', 'last');
  })

})