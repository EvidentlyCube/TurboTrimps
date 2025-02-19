
window.turbo = 1;
window.turboHasSlowedDown = false;
window.turboTimeValues = [1, 10, 100, 250, 500, 1000];

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

    } else {
        const index = window.turboTimeValues.indexOf(window.turbo);

        if (index === -1) {
            window.turbo = window.turboTimeValues[0];
        } else {
            window.turbo = window.turboTimeValues[(index + 1) % window.turboTimeValues.length];
        }
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
        if (!game) {
            return;
        }

        let delta = Date.now() - lastTurboTick;
        if (game.options.menu.turboSlowdown.enabled === 1 && delta > 10) {
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
        }

        lastTurboTick += delta;

        let turboAdjustedDelta = delta * (window.turbo - 1)
        game.global.turboCounter += turboAdjustedDelta;

        let attempts = 0;
        while (true) {
            if (attempts++ > 1000) {
                break;
            }
            const accumulatedTime = getCurrentTimestamp() - game.global.start - game.global.time;
            const turboAdjustedAccumulation = accumulatedTime / window.turbo;

            if (turboAdjustedAccumulation > 200) {
                game.global.turboCounter -= turboAdjustedDelta;
                turboAdjustedDelta *= 0.75;
                game.global.turboCounter += turboAdjustedDelta;
            } else {
                break;
            }
        }

        setTimeout(callback, 1);
    }

    setTimeout(callback, 1);
})()