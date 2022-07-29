/// <reference path="./urlgen.ts" />

function fetchServers(): Promise<Server[]> {
    return fetch(UrlGen.serverList())
        .then(response => response.json());
}

function fetchContinents(): Promise<Continent[]> {
    return fetch(UrlGen.continentList())
        .then(response => response.json());
}

function fetchContinentLattice(continentId: number): Promise<LatticeLink[]> {
    return fetch(UrlGen.latticeForContinent(continentId))
        .then(response => response.json());
}

function fetchBasesForContinent(continentId: number): Promise<Base[]> {
    return fetch(UrlGen.basesForContinent(continentId))
        .then(response => response.json());
}

function fetchBaseStatus(continentId: number, serverId: number): Promise<BaseStatus[]> {
    return fetch(UrlGen.baseStatus(continentId, serverId))
        .then(response => response.json());
}
