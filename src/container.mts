import { DbPopulateService } from './config/dev/db-populate.mts';
import { KeycloakService } from './security/keycloak-service.mts';

export const container = {
  //todo: Alle Services hier registrieren, damit sie in der gesamten App ueber Dependency Injection verfuegbar sind
  //soldatService,
  //soldatWriteService: new SoldatWriteService(soldatService),
  keycloakService: new KeycloakService(),
  dbPopulateService: new DbPopulateService(),
};
