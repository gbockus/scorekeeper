import {PrismaClient} from '@prisma/client'
import {v4 as uuid} from "uuid";

const prisma = new PrismaClient()


export class DAO {

  async getMatchByKey(key: string) {
    const match = await prisma.match.findFirst({
      where: {
        key,
      },
      include: {
        teams: true,
        sets: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    console.log('found match', {match});
    return match;
  }

  async getMatches() {
    return await prisma.match.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        teams: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });
  }

  async createScoreboard(teamOneId: number, teamTwoId: number) {
    return await prisma.match.create({
      data: {
        complete: false,
        key: uuid(),
        sets: {
          create: [{
            setNumber: 1,
            teamOneScore: 0,
            teamTwoScore: 0,
            complete: false,
            teamOne: {
              connect: {id: teamOneId}
            },
            teamTwo: {
              connect: {id: teamTwoId}
            }
          }]
        },
        teams: {connect: [{id: teamOneId}, {id: teamTwoId}]}
      }
    });
  }

  async getTeams() {
    return await prisma.team.findMany();
  }


  async addSet(id: number) {
    const match = await prisma.match.findUnique({
      where: {id},
      include: {
        sets: true,
        teams: true
      }
    });

    await prisma.set.create({
      data: {
        complete: false,
        setNumber: match.sets.length + 1,
        teamOneId: match.teams[0].id,
        teamOneScore: 0,
        teamTwoId: match.teams[1].id,
        teamTwoScore: 0,
        matchId: match.id,
      }
    });

    return this.getMatchByKey(match.key);
  }

  async updateSetScore(id: number, teamOneScore: number, teamTwoScore: number) {
    console.log('updateSetScore', {
      id, teamOneScore, teamTwoScore
    });
    const updatedSet = await prisma.set.update({
      where: {
        id
      },
      data: {
        teamOneScore,
        teamTwoScore
      }, include: {
        match: {
          select: {
            key: true
          }
        }
      }
    });
    return this.getMatchByKey(updatedSet.match.key);

  }

  async updateMatchComplete(id: number, complete: boolean) {
    console.log('updateMatchComplete', {id, complete});
    const match = await prisma.match.update({
      where: {
        id,
      },
      data: {
        complete
      }
    });
    console.log('updated', {match});
    await prisma.set.updateMany({
      where: {
        matchId: id
      },
      data: {
        complete
      }
    });
    return await this.getMatchByKey(match.key);
  }

  async createTeam(name: string) {
    await prisma.team.create({
      data: {
        name
      }
    });
  }
}