Feature: End to end

  As a user
  I want to be able to perform a TODO
  So that I can TODO

  Scenario: Performing a check
    When I complete a process
    Then I should see that the process has been submitted
    And the data in the backend should match the answers given
