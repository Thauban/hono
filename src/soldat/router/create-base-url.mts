import { SoldatService } from '../service/soldat-service.mts';
import { type HonoRequest } from 'hono';

export const createBaseUrl: (req: HonoRequest) => string = (
    req: HonoRequest,
) => {
    const { url } = req;
    // Query-String entfernen, falls vorhanden
    let baseUrl = url.includes('?') ? url.slice(0, url.lastIndexOf('?')) : url;

    // ID entfernen, falls der Pfad damit endet
    const indexLastSlash = baseUrl.lastIndexOf('/');
    if (indexLastSlash > 0) {
        const idStr = baseUrl.slice(indexLastSlash + 1);
        if (SoldatService.ID_PATTERN.test(idStr)) {
            baseUrl = baseUrl.slice(0, indexLastSlash);
        }
    }

    return baseUrl;
};
