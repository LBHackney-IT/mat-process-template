Feature: Accessibility

  As a user with access needs
  I want to have my needs met
  So that I can use the service

  Scenario: Index page is accessible
    When I visit the index page
    Then the page should be accessible
    And the page should have a descriptive title

  Scenario: Loading page is accessible
    When I start the process
    And I wait for the data to be fetched
    Then the page should be accessible
    And the page should have a descriptive title

  Scenario: Review page is accessible
    When I start the process
    And I wait for the data to be fetched
    And I visit /review for the process
    Then the page should be accessible
    And the page should have a descriptive title

  Scenario: Submit page is accessible
    When I start the process
    And I wait for the data to be fetched
    And I visit /submit for the process
    Then the page should be accessible
    And the page should have a descriptive title

  Scenario: Confirmed page is accessible
    When I start the process
    And I wait for the data to be fetched
    And I visit /confirmed for the process
    Then the page should be accessible
    And the page should have a descriptive title

  Scenario: Pause page is accessible
    When I start the process
    And I wait for the data to be fetched
    And I visit /pause for the process
    Then the page should be accessible
    And the page should have a descriptive title

  Scenario: Paused page is accessible
    When I start the process
    And I wait for the data to be fetched
    And I visit /paused for the process
    Then the page should be accessible
    And the page should have a descriptive title
