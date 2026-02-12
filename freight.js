// Freight Module Script

document.addEventListener('DOMContentLoaded', function() {
    initializeFreightPage();
    updateCartCount();
    initializeLanguage();
    setupFreightEventListeners();
});

function initializeFreightPage() {
    // Check if user is logged in for freight services
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Load freight rates from localStorage or initialize
    if (!localStorage.getItem('freightRates')) {
        initializeFreightRates();
    }
}

function initializeFreightRates() {
    const freightRates = {
        local: {
            baseRate: 10,
            perKg: 2,
            freeShippingThreshold: 100,
            zones: [
                { name: 'Klang Valley', multiplier: 1 },
                { name: 'Peninsular Malaysia', multiplier: 1.2 },
                { name: 'Sabah & Sarawak', multiplier: 1.5 }
            ]
        },
        international: {
            baseRate: 50,
            perKg: 10,
            zones: [
                { zone: 'asia', name: 'Asia', multiplier: 1.2, baseRate: 60, perKg: 12 },
                { zone: 'europe', name: 'Europe', multiplier: 1.5, baseRate: 75, perKg: 15 },
                { zone: 'america', name: 'America', multiplier: 1.8, baseRate: 90, perKg: 18 },
                { zone: 'others', name: 'Other Regions', multiplier: 2.0, baseRate: 100, perKg: 20 }
            ]
        }
    };
    
    localStorage.setItem('freightRates', JSON.stringify(freightRates));
}

function setupFreightEventListeners() {
    const freightType = document.getElementById('freightType');
    const internationalZone = document.getElementById('internationalZone');
    const freightDimensions = document.getElementById('freightDimensions');
    const calculateBtn = document.getElementById('calculateFreightBtn');
    
    if (freightType) {
        freightType.addEventListener('change', function() {
            if (this.value === 'international') {
                internationalZone.style.display = 'block';
                freightDimensions.style.display = 'block';
            } else {
                internationalZone.style.display = 'none';
                freightDimensions.style.display = 'none';
            }
        });
    }
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateFreight);
    }
    
    // Tracking number input
    const trackingInput = document.getElementById('trackingNumber');
    if (trackingInput) {
        trackingInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackShipment();
            }
        });
    }
}

function calculateFreight() {
    const type = document.getElementById('freightType').value;
    const weight = parseFloat(document.getElementById('freightWeight').value);
    const resultDiv = document.getElementById('freightResult');
    
    if (!weight || weight <= 0) {
        showNotification('Please enter valid weight', 'error');
        return;
    }
    
    const freightRates = JSON.parse(localStorage.getItem('freightRates'));
    let cost = 0;
    let details = '';
    const currentLang = localStorage.getItem('language') || 'en';
    
    if (type === 'local') {
        const rates = freightRates.local;
        cost = rates.baseRate + (weight * rates.perKg);
        
        if (cost > rates.freeShippingThreshold) {
            details = ' (Free shipping eligible!)';
        }
        
        resultDiv.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${getTranslation('freight_cost')}</h3>
                <p style="font-size: 2rem; color: var(--secondary-color); font-weight: bold;">RM ${cost.toFixed(2)}</p>
                <p>Base Rate: RM ${rates.baseRate} + RM ${rates.perKg}/kg × ${weight}kg = RM ${cost.toFixed(2)}</p>
                <p style="color: ${cost > rates.freeShippingThreshold ? '#27ae60' : '#e74c3c'}; margin-top: 0.5rem;">
                    ${cost > rates.freeShippingThreshold ? '✓ Free shipping eligible!' : 'Add more items to qualify for free shipping'}
                </p>
                <p style="margin-top: 1rem;">Estimated delivery: 1-3 business days</p>
            </div>
        `;
    } else {
        const zone = document.getElementById('internationalZone').value;
        const dimensions = document.getElementById('freightDimensions').value;
        const zoneRates = freightRates.international.zones.find(z => z.zone === zone);
        
        if (zoneRates) {
            cost = zoneRates.baseRate + (weight * zoneRates.perKg);
            
            // Add volumetric weight calculation if dimensions provided
            if (dimensions) {
                const [l, w, h] = dimensions.split('x').map(Number);
                if (l && w && h) {
                    const volumetricWeight = (l * w * h) / 5000;
                    cost = zoneRates.baseRate + (Math.max(weight, volumetricWeight) * zoneRates.perKg);
                    details += `<p>Volumetric weight: ${volumetricWeight.toFixed(2)} kg</p>`;
                }
            }
            
            resultDiv.innerHTML = `
                <div style="text-align: center;">
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${getTranslation('freight_cost')}</h3>
                    <p style="font-size: 2rem; color: var(--secondary-color); font-weight: bold;">RM ${cost.toFixed(2)}</p>
                    <p>Zone: ${zoneRates.name}</p>
                    <p>Base Rate: RM ${zoneRates.baseRate} + RM ${zoneRates.perKg}/kg × ${weight}kg</p>
                    ${details}
                    <p style="margin-top: 1rem;">Estimated delivery: 3-7 business days</p>
                    <p style="color: #f39c12; margin-top: 0.5rem;">
                        <i class="fas fa-info-circle"></i> Customs duties and taxes may apply
                    </p>
                </div>
            `;
        }
    }
    
    // Log freight calculation
    logSystemEvent(`Freight calculated: ${type}, ${weight}kg, RM${cost}`, 'INFO');
    
    // Save to Google Sheets
    saveFreightCalculationToGCS(type, weight, cost);
}

async function saveFreightCalculationToGCS(type, weight, cost) {
    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'log',
                level: 'INFO',
                message: `Freight calculation - Type: ${type}, Weight: ${weight}kg, Cost: RM${cost}`,
                user: JSON.parse(localStorage.getItem('currentUser'))?.email || 'guest',
                page: 'freight',
                app: CONFIG.APP_NAME,
                version: CONFIG.VERSION
            })
        });
    } catch (error) {
        console.log('Freight calculation saved locally');
    }
}

function trackShipment() {
    const trackingNumber = document.getElementById('trackingNumber').value;
    const resultDiv = document.getElementById('trackingResult');
    
    if (!trackingNumber) {
        showNotification('Please enter a tracking number', 'error');
        return;
    }
    
    // Simulate tracking
    const trackingStatus = [
        'Order placed',
        'Processing',
        'Picked up by courier',
        'In transit',
        'Out for delivery',
        'Delivered'
    ];
    
    const randomStatus = trackingStatus[Math.floor(Math.random() * trackingStatus.length)];
    const currentDate = new Date();
    const estimatedDate = new Date(currentDate.setDate(currentDate.getDate() + 3));
    
    resultDiv.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center;">
            <i class="fas fa-box" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 1rem;"></i>
            <h3>Tracking Number: ${trackingNumber}</h3>
            <div style="margin: 2rem 0;">
                <span style="background: ${randomStatus === 'Delivered' ? '#27ae60' : '#3498db'}; color: white; padding: 0.5rem 1rem; border-radius: 4px;">
                    Status: ${randomStatus}
                </span>
            </div>
            <p>Last updated: ${new Date().toLocaleString()}</p>
            <p>Estimated delivery: ${estimatedDate.toLocaleDateString()}</p>
            
            <div style="margin-top: 2rem; text-align: left; background: var(--light-bg); padding: 1rem; border-radius: 4px;">
                <h4>Tracking History</h4>
                <ul style="list-style: none; margin-top: 1rem;">
                    <li style="margin-bottom: 0.5rem;">✓ ${new Date().toLocaleString()} - ${randomStatus}</li>
                    <li style="margin-bottom: 0.5rem;">✓ ${new Date(Date.now() - 86400000).toLocaleString()} - In transit</li>
                    <li style="margin-bottom: 0.5rem;">✓ ${new Date(Date.now() - 172800000).toLocaleString()} - Picked up by courier</li>
                </ul>
            </div>
        </div>
    `;
    
    logSystemEvent(`Shipment tracked: ${trackingNumber} - Status: ${randomStatus}`, 'INFO');
}

// Create freight order
function createFreightOrder(freightData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Please login to create freight order', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const freightOrder = {
        id: 'FREIGHT_' + Date.now(),
        userId: currentUser.id,
        userEmail: currentUser.email,
        ...freightData,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save freight order to localStorage
    let freightOrders = JSON.parse(localStorage.getItem('freightOrders')) || [];
    freightOrders.push(freightOrder);
    localStorage.setItem('freightOrders', JSON.stringify(freightOrders));
    
    // Sync with Google Sheets
    syncFreightOrderToGCS(freightOrder);
    
    showNotification('Freight order created successfully!', 'success');
    logSystemEvent(`Freight order created: ${freightOrder.id}`, 'INFO');
    
    return freightOrder;
}

async function syncFreightOrderToGCS(freightOrder) {
    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createFreightOrder',
                table: CONFIG.TABLES.FREIGHT,
                data: freightOrder
            })
        });
    } catch (error) {
        console.log('Freight order saved locally');
    }
}

// Export functions for global use
window.calculateFreight = calculateFreight;
window.trackShipment = trackShipment;
window.createFreightOrder = createFreightOrder;