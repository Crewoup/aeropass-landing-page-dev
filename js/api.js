const BASE_URL = 'https://api.captainai.app/api';

/**
 * Verify Firebase ID Token
 * @param {string} idToken 
 * @param {number|null} currentStageId 
 */
export async function verifyFirebaseToken(idToken, currentStageId = null) {
    const response = await fetch(`${BASE_URL}/auth/firebase/verify`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_token: idToken,
            current_stage_id: currentStageId
        })
    });
    return response.json();
}

/**
 * Get current user profile
 * @param {string} token 
 */
export async function getMe(token) {
    const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

/**
 * Update user profile
 * @param {string} token 
 * @param {Object} profileData 
 */
export async function updateProfile(token, profileData) {
    const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    });
    return response.json();
}

/**
 * Get airlines reference data
 * @param {string} token 
 */
export async function getAirlines(token) {
    const response = await fetch(`${BASE_URL}/reference-data/airlines`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}
