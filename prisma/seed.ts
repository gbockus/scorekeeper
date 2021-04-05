import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  // await prisma.tournament.deleteMany();
  // await prisma.set.deleteMany();
  // await prisma.team.deleteMany();
  // await prisma.match.deleteMany();
  const nhvc = await prisma.team.create({
    data: {
      name: `NHVC`
    },
  });

  const empower = await prisma.team.create({
    data: {
      name: `Empower Junior 14 Pride`
    },
  });

  const green = await prisma.team.create({
    data: {
      name: `Roots Green`
    },
  });

  const maple = await prisma.team.create({
    data: {
      name: `Roots Maple`
    },
  });

  const roots4 = await prisma.tournament.create({
    data: {
      name: 'Roots #5',
      teams: {connect: [{id: nhvc.id}, {id: empower.id}, {id: green.id}, {id: maple.id}]}
    }
  });

  const match = {
    data: {
      complete: true,
      key: '8b7edeab-5b4d-4c39-af39-ed80d63efa94',
      sets: {
        create: [{
          setNumber: 1,
          teamOneScore: 21,
          teamTwoScore: 25,
          complete: true,
          teamOne: {
            connect: {id: nhvc.id}
          },
          teamTwo: {
            connect: {id: green.id}
          }
        }, {
          setNumber: 2, teamOneScore: 11, teamTwoScore: 25, complete: true,
          teamOne: {
            connect: {id: nhvc.id}
          },
          teamTwo: {
            connect: {id: green.id}
          }
        }]
      },
      teams: {connect: [{id: nhvc.id}, {id: green.id}]}
    }

  };

  await prisma.match.create(match);

  const match2 = {
    data: {
      complete: true,
      key: '3ac86922-b71a-453a-bee1-2268179999da',
      sets: {
        create: [{
          setNumber: 1,
          teamOneScore: 25,
          teamTwoScore: 17,
          complete: true,
          teamOne: {
            connect: {id: nhvc.id}
          },
          teamTwo: {
            connect: {id: empower.id}
          }
        }, {
          setNumber: 2, teamOneScore: 25, teamTwoScore: 14, complete: true,
          teamOne: {
            connect: {id: nhvc.id}
          },
          teamTwo: {
            connect: {id: empower.id}
          }
        }]
      },
      teams: {connect: [{id: nhvc.id}, {id: empower.id}]}
    }
  };

  await prisma.match.create(match2);

  const match3 = {
    data: {
      complete: true,
      key: '0b4dddca-6b1a-456b-b8ec-47c81c9d3df8',
      sets: {
        create: [{
          setNumber: 1,
          teamOneScore: 25,
          teamTwoScore: 18,
          complete: true,
          teamOne: {
            connect: {id: nhvc.id}
          },
          teamTwo: {
            connect: {id: maple.id}
          }
        }, {
          setNumber: 2, teamOneScore: 26, teamTwoScore: 24, complete: true,
          teamOne: {
            connect: {id: nhvc.id}
          },
          teamTwo: {
            connect: {id: maple.id}
          }
        }]
      },
      teams: {connect: [{id: nhvc.id}, {id: maple.id}]}
    }
  };

  await prisma.match.create(match3);


  console.log({ nhvc, empower, green, maple });

}
main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })