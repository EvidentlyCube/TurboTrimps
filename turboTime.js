
window.turbo = 1;
window.turboHasSlowedDown = false;

function getCurrentTimestamp() {
    if (window.game) {
        return Date.now() + game.global.turboCounter;
    } else {
        return Date.now();
    }
}

function getCurrentDate() {
    return new Date(getCurrentTimestamp());
}

function toggleTurbo() {
    if (window.turboHasSlowedDown) {
        window.turbo = 1;

    } else if (window.turbo === 1) {
        window.turbo = 10;

    } else if (window.turbo === 10) {
        window.turbo = 60;

    } else if (window.turbo === 60) {
        window.turbo = 100;

    } else if (window.turbo === 100) {
        window.turbo = 500;

    } else {
        window.turbo = 1;
    }

    updateTurboButtons();
}

function updateTurboButtons() {
    const $button = document.getElementById('turboButtonText');
    if (window.turbo > 1) {
        $button.parentElement.classList.remove('btn-no-turbo');
        $button.parentElement.classList.add('btn-turbo');
        $button.innerText = `Turbo x${window.turbo}`
    } else {
        $button.parentElement.classList.remove('btn-turbo');
        $button.parentElement.classList.add('btn-no-turbo');
        $button.innerText = `No Turbo`
    }
}

(function() {
    let lastTurboTick = Date.now();
    let deltaHistory = [];
    let callback = () => {
        let delta = Date.now() - lastTurboTick;
        deltaHistory.push(delta);
        while(deltaHistory.length > 10) {
            deltaHistory.shift();
        }

        const averageDelta = deltaHistory.reduce((l,r) => l+r) / 10;

        if (averageDelta > 100 || delta > 150) {
            const factor = Math.max(
                0.8,
                delta > 150 ? 0.8 : 100 / averageDelta
            );
            window.turbo = Math.max(1, (window.turbo * factor) | 0);
            averageDelta.length = 0;
            updateTurboButtons();
        }
        lastTurboTick += delta;
        if (window.game) {
            game.global.turboCounter += delta * (window.turbo - 1);
        }

        setTimeout(callback, 1);
    }

    setTimeout(callback, 1);
})()