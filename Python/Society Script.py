pageBreak =  "                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "

def gameStart():

    playerScores = {}
    groupScores = {}
    groupSizes = {}
    teamScores = {}
    teamSizes = {}
    teamAssignments = {}
    groupAssignments = {}
    societyScore = 0
    
    numPlayers = input("How many players are there? ")
    numGroups = input("How many groups are there? ")
    numTeams = input("How many teams are there? ")

    societyScore = numPlayers * 5

    for player in range(numPlayers):
        playerScores[player + 1] = 20
        groupAssignment = input("What group is player " + str(player+1) + " on? ")
        groupAssignments[player + 1] = groupAssignment

    for team in range(numTeams):
        teamScores[team + 1] = societyScore

    for group in range(numGroups):
        groupScores[group + 1] = societyScore * numTeams / numGroups
        wording = "How many players are in group " + str(group + 1) + "? "
        groupSize = input(wording)
        groupSizes[group + 1] = groupSize
        teamAssignment = input("What team is this group on? ")
        teamAssignments[group + 1] = teamAssignment
        if len(teamSizes) < teamAssignment:
            teamSizes[teamAssignment] = groupSize
        else:
            teamSizes[teamAssignment] += groupSize

    print pageBreak
            
    return [numPlayers, numGroups, numTeams, playerScores, groupScores, groupSizes, teamScores, teamSizes, teamAssignments, groupAssignments, societyScore]
    

def getDecision():
    decision = input("Which decision will you choose? ")
    print pageBreak
    if decision == 1:
        return [2,-2,-1, 1]
   
    elif decision == 2:
        return [-1,2,0, 2]
     
    elif decision == 3:
        return [1,1,-1, 3]
    
    else:
        return [-1,0,2, 4]


values = gameStart()

numPlayers = values[0]
numGroups = values[1]
numTeams = values[2]
playerScores = values[3]
groupScores = values[4]
groupSizes = values[5]
teamScores = values[6]
teamSizes = values[7]
teamAssignments = values[8]
groupAssignments = values[9]
societyScore = values[10]
teamDecisions = {}

pastDecisions = {}

for player in range(numPlayers):
    pastDecisions[player + 1] = []

roundNumber = 1

while roundNumber < 13:

    decisionsThisRound = []
    for team in range(numTeams):
        teamDecisions[team+1] = []
    
    for player in range(numPlayers):
        scoreChanges = getDecision()
        pastDecisions[player+1].append(scoreChanges[3])
        playerScores[player + 1] += scoreChanges[0]
        groupScores[groupAssignments[player+1]] += scoreChanges[1]
        societyScore += scoreChanges[2]
        decisionsThisRound.append(scoreChanges[3])
        newList = teamDecisions[teamAssignments[groupAssignments[player+1]]]
        newList.append(scoreChanges[3])
        teamDecisions[teamAssignments[groupAssignments[player+1]]] = newList
        
        
        

        
    for team in range(numTeams):
        score = 0
        for group in teamAssignments.keys():
            if teamAssignments[group] == (team + 1):
                score += groupScores[group]
        teamScores[team+1] = score

    roundNumber += 1
            
    print "round number: " + str(roundNumber)
    print "world score: " + str(societyScore)
    print "country scores: " + str(teamScores)
    print "group scores: " + str(groupScores)
    print "player scores: " + str(playerScores)
    print "decisions this round: " + str(decisionsThisRound)
    print "team decisions this round: " + str(teamDecisions)
    if roundNumber == 4 or roundNumber == 7 or roundNumber == 10:
        print "QUARTERLY REPORTS ARE OUT"
    print "past decisions for each player " + str(pastDecisions)
    for team in teamDecisions.keys():
        counter = 0
        firstDecision = teamDecisions[team][0]
        for decision in teamDecisions[team]:
            if decision != firstDecision:
                counter += 1
        if counter == 0:
            print "WORLD EVENT for team " + str(team) + " (WORLD EVENT " + str(firstDecision) + ")"
    print pageBreak
    print "End of round"



##def worldEvent(eventNumber):
##    if eventNumber = 1:
##        return[



print "Game Over"
input("")

















    
