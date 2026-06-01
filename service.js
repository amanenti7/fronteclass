const API = "http://localhost:3000";

export async function getGames() {
    const response = await fetch(`${API}/games`);
    return await response.json();
}

export async function getTeams() {
    const response = await fetch(`${API}/teams`);
    return await response.json();
}

export async function getCompetitors() {
    const response = await fetch(`${API}/competitors`);
    return await response.json();
}

export async function getMatches() {
    const response = await fetch(`${API}/matches`);
    return await response.json();
}