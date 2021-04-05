# scorekeeper

## Prisma know how
To update the database alter the schema.prisma file then run 

create the migration file

`yarn prisma migrate dev --name aUniqureName` 

Verify the change

`yarn prisma format`  

Generate the new client
`yarn prisma generate`


### To execute the seed file

`yarn run prisma db seed --preview-feature`

### TO see the web based stuido
`yara prisma studio`