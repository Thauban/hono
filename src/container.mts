import { DbPopulateService } from './config/dev/db-populate.mts';
import { KeycloakService } from './security/keycloak-service.mts';
import { SoldatService } from './soldat/service/soldat-service.mts';
import { SoldatWriteService } from './soldat/service/soldat-write-service.mts';

const soldatService = new SoldatService();

export const container = {
    
    soldatService,
    soldatWriteService: new SoldatWriteService(soldatService),
    keycloakService: new KeycloakService(),
    dbPopulateService: new DbPopulateService(),
};
