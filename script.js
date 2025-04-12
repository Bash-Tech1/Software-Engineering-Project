// Client-Server Architecture Implementation

// ========================
// Client Side (UI Handling)
// ========================

class CalculatorClient {
    constructor() {
        this.server = new CalculatorServer();
        this.currentTab = 'basic';
        this.initEventListeners();
        updateCreditsDisplay();
    }
    initEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });

        this.initPaymentForm();
    }

    initPaymentForm() {
        const cardInput = document.getElementById('card-number');
        if (cardInput) {
            cardInput.addEventListener('input', function () {
                this.value = this.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            });
        }

        const expiryInput = document.getElementById('expiry-date');
        if (expiryInput) {
            expiryInput.addEventListener('input', function () {
                this.value = this.value.replace(/^(\d\d)(\d)$/g, '$1/$2')
                    .replace(/^(\d\d\/\d\d)(\d+)$/g, '$1')
                    .replace(/[^\d\/]/g, '');
            });
        }

        const payBtn = document.getElementById('process-payment');
        if (payBtn) {
            payBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }
    }

    validateCard() {
        const cardNumber = document.getElementById('card-number')?.value.replace(/\s/g, '') || '';
        const expiryDate = document.getElementById('expiry-date')?.value || '';
        const cvv = document.getElementById('cvv')?.value || '';
        const cardName = document.getElementById('card-name')?.value || '';

        if (!/^\d{16}$/.test(cardNumber)) {
            alert('Please enter a valid 16-digit card number');
            return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            alert('Please enter a valid expiry date (MM/YY)');
            return false;
        }
        if (!/^\d{3}$/.test(cvv)) {
            alert('Please enter a valid 3-digit CVV');
            return false;
        }
        if (cardName.trim().length < 3) {
            alert('Please enter the name on your card');
            return false;
        }
        return true;
    }

    async processPayment() {
        if (!this.validateCard()) return;

        const btn = document.getElementById('process-payment');
        if (!btn) return;

        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            await new Promise(resolve => setTimeout(resolve, 2000));
            this.server.paymentService.addCredits(50);

            alert('Payment successful! 50 credits added.');

            const cardNumber = document.getElementById('card-number');
            const expiryDate = document.getElementById('expiry-date');
            const cvv = document.getElementById('cvv');
            const cardName = document.getElementById('card-name');

            if (cardNumber) cardNumber.value = '';
            if (expiryDate) expiryDate.value = '';
            if (cvv) cvv.value = '';
            if (cardName) cardName.value = '';

        } catch (error) {
            alert('Payment failed: ' + (error.message || 'Unknown error'));
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-lock"></i> Pay $5.00 for 50 Credits';
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');

            if (tabId === 'credits') {
                const creditForm = selectedTab.querySelector('form');
                if (creditForm) {
                    creditForm.style.display = 'block';
                }

                const hasNotification = selectedTab.querySelector('.credits-notification');
                if (this.server.paymentService.credits <= 0 && !hasNotification) {
                    const notificationDiv = document.createElement('div');
                    notificationDiv.className = 'credits-notification';
                    notificationDiv.textContent = 'You\'ve run out of credits. Please purchase more to continue.';
                    selectedTab.insertBefore(notificationDiv, creditForm);
                }

                if (this.server.paymentService.credits > 0 && hasNotification) {
                    hasNotification.remove();
                }
            }
        }

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        this.currentTab = tabId;
    }

    async handleFormSubmit(form) {
        try {
            const result = await this.server.solve(this.currentTab, this.getFormData(form));
            this.displayResult(this.currentTab, result);
        } catch (error) {
            this.displayError(this.currentTab, error.message);
        }
    }

    getFormData(form) {
        const data = {};
        form.querySelectorAll('input, select').forEach(input => {
            if (input.type !== 'submit') data[input.id] = input.value;
        });
        return data;
    }

    displayResult(tabId, result) {
        const element = document.querySelector(`#${tabId}-result`);
        if (element) {
            element.textContent = result;
            element.style.color = 'var(--dark-color)';
        }
    }

    displayError(tabId, message) {
        const element = document.querySelector(`#${tabId}-result`);
        if (element) {
            element.textContent = `Error: ${message}`;
            element.style.color = 'var(--warning-color)';
        }
    }
}

// ========================
// Server Side (Business Logic)
// ========================

class CalculatorServer {
    constructor() {
        this.paymentService = new PaymentService();
        this.solverFactory = new SolverFactory(this.paymentService);
    }

    async solve(problemType, data) {
        const solver = this.solverFactory.createSolver(problemType);
        return solver.solve(data);
    }
}

// ========================
// Factory Pattern
// ========================

class SolverFactory {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }

    createSolver(problemType) {
        switch (problemType) {
            case 'basic': return new BasicOperationSolver();
            case 'linear': return new LinearEquationSolver();
            case 'quadratic': return new QuadraticEquationSolver();
            case 'first-deriv': return new DerivativeSolver(1, this.paymentService);
            case 'second-deriv': return new DerivativeSolver(2, this.paymentService);
            default: throw new Error('Unknown problem type');
        }
    }
}

// ========================
// Strategy Pattern (Solvers)
// ========================

class MathSolver {
    solve() { throw new Error('Method not implemented'); }
}

class BasicOperationSolver extends MathSolver {
    solve(data) {
        const num1 = parseFloat(data.num1);
        const num2 = parseFloat(data.num2);
        const operation = data['basic-operation'];

        switch (operation) {
            case 'add': return num1 + num2;
            case 'subtract': return num1 - num2;
            case 'multiply': return num1 * num2;
            case 'divide':
                if (num2 === 0) throw new Error('Division by zero');
                return num1 / num2;
            default: throw new Error('Invalid operation');
        }
    }
}

class LinearEquationSolver extends MathSolver {
    solve(data) {
        const a = parseFloat(data['linear-a']);
        const b = parseFloat(data['linear-b']);
        if (a === 0) return b === 0 ? 'Infinite solutions' : 'No solution';
        return `x = ${(-b / a).toFixed(4)}`;
    }
}

class QuadraticEquationSolver extends MathSolver {
    solve(data) {
        const a = parseFloat(data['quad-a']);
        const b = parseFloat(data['quad-b']);
        const c = parseFloat(data['quad-c']);

        if (a === 0) {
            if (b === 0) return c === 0 ? 'Infinite solutions' : 'No solution';
            return `x = ${(-c / b).toFixed(4)}`;
        }

        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            const real = (-b / (2 * a)).toFixed(4);
            const imag = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
            return `x₁ = ${real} + ${imag}i, x₂ = ${real} - ${imag}i`;
        }

        const sqrt = Math.sqrt(discriminant);
        const x1 = (-b + sqrt) / (2 * a);
        const x2 = (-b - sqrt) / (2 * a);
        return discriminant === 0 ? `x = ${x1.toFixed(4)}` : `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
    }
}

class DerivativeSolver extends MathSolver {
    constructor(order, paymentService) {
        super();
        this.order = order;
        this.paymentService = paymentService;
    }

    solve(data) {
        if (!this.paymentService.hasSufficientCredits(5)) {
            alert('You don’t have enough credits. Please top up to use this feature.');
            const calculator = window.calculatorInstance;
            if (calculator) calculator.switchTab('credits');
            throw new Error('Insufficient credits - Need 5 credits for derivative calculations');
        }

        this.paymentService.deductCredits(5);

        const expression = data[`${this.order === 1 ? 'first' : 'second'}-deriv-fx`];
        if (!expression) throw new Error('Function expression required');

        try {
            let derivative = math.derivative(expression, 'x');
            if (this.order === 2) derivative = math.derivative(derivative, 'x');
            return derivative.toString();
        } catch {
            throw new Error('Invalid function expression');
        }
    }
}

// ========================
// Payment Service
// ========================

class PaymentService {
    constructor() {
        this._credits = parseInt(localStorage.getItem('user_credits')) || 10;
    }

    get credits() {
        return this._credits;
    }

    hasSufficientCredits(amount) {
        return this._credits >= amount;
    }

    deductCredits(amount) {
        if (this._credits < amount) throw new Error('Insufficient credits');
        this._credits -= amount;
        this.saveCredits();
        updateCreditsDisplay();
    }

    addCredits(amount) {
        if (amount <= 0) throw new Error('Invalid credit amount');
        this._credits += amount;
        this.saveCredits();
        updateCreditsDisplay();
    }

    saveCredits() {
        localStorage.setItem('user_credits', this._credits);
    }
}

// ========================
// Utilities
// ========================

window.updateCreditsDisplay = function () {
    const calculator = window.calculatorInstance;
    if (!calculator || !calculator.server?.paymentService) return;

    const credits = calculator.server.paymentService.credits;

    const creditDisplay = document.getElementById('credits-display');
    const currentCredits = document.getElementById('current-credits');

    if (creditDisplay) creditDisplay.textContent = credits;
    if (currentCredits) currentCredits.textContent = credits;

    if (credits <= 0 && calculator.currentTab !== 'credits') {
        calculator.switchTab('credits');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.calculatorInstance = new CalculatorClient();
});
