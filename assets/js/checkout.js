const { createApp } = Vue

createApp({
    data() {
        return {
            itemTotal: 10,
            cost: 500000,
            dropshiperAmount: 5900,
            deliveryAddresLimit: 120,
            dropshiperFee: 0,
            shipmentFee: 0,
            paymentTotal: 0,
            stepForm: 'delivery',
            deliveryEstimateValue: '',
            deliveryValue: '',
            paymentValue: '',
            orderId:'',
            inputError: {},
            form: {
                email: '',
                phone: '',
                delivery_address: '',
                dropshiper_status: false,
                dropshiper_name: '',
                dropshiper_phone: '',
                delivery_method: {},
                payment_method: {}
            },
            deliveryList: [
                {
                    id: 1,
                    name: 'GO-SEND',
                    amount: 15000,
                    estimate: 'today'
                },
                {
                    id: 2,
                    name: 'JNE',
                    amount: 9000,
                    estimate: '2 days'
                },
                {
                    id: 3,
                    name: 'Personal Courier',
                    amount: 29000,
                    estimate: '1 day'
                }
            ],
            paymentList: [
                {
                    id: 1,
                    name: 'e-Wallet',
                    amount: 1500000
                },
                {
                    id: 2,
                    name: 'Bank Transfer'
                },
                {
                    id: 3,
                    name: 'Virtual Account'
                }
            ],
            checkRealTimeValidation: {
                delivery: false,
                payment: false
            }
        }
    },
    methods: {
        formatPrice(value) {
            if (value) {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            } else {
                return 0
            }
        },
        calculatePaymentTotal(){
            this.paymentTotal = this.cost + this.dropshiperFee + this.shipmentFee
        },
        calculateDropshiperFee(){
            this.dropshiperFee = (this.form.dropshiper_status === true) ? this.dropshiperAmount : 0
            this.calculatePaymentTotal()

            if (this.form.dropshiper_status === false) {
                this.form.dropshiper_name = ''
                this.form.dropshiper_phone = ''
            }
        },
        calculateDeliveryFee(value){
            this.deliveryEstimateValue = value.estimate + ' by ' + value.name
            this.deliveryValue = value.name + ' '
            this.form.delivery_method = value
            this.shipmentFee = value.amount
            this.calculatePaymentTotal()
        },
        selectPayment(value){
            this.form.payment_method = value
            this.paymentValue = value.name
        },
        stepChange(value){
            var currentStep = this.stepIndicator()
            
            if (value === 'delivery' && currentStep === 2) {
                this.stepForm = value
            }
        },
        stepButtonLabel(){
            var indicatorActive = this.stepIndicator()
            var label = 'Continue to Payment'

            if (indicatorActive >= 2) {
                label = (this.paymentValue) ? 'Pay with ' + this.paymentValue : 'Pay' 
            } 
            
            return label
        },
        stepIndicator(){
            var indicatorActive = 0

            if (this.stepForm === 'delivery') {
                indicatorActive = 1
            } else if (this.stepForm === 'payment') {
                indicatorActive = 2
            } else if (this.stepForm === 'finish') {
                indicatorActive = 3
            }

            return indicatorActive
        },
        submit(){
            var indicatorActive = this.stepIndicator()
            if (indicatorActive === 1) {
                this.checkRealTimeValidation.delivery = true                            
                this.validateInputStepDelivery()

                if (Object.keys(this.inputError).length < 1) {
                    this.stepForm = 'payment'
                }
            } else if (indicatorActive === 2) {
                this.checkRealTimeValidation.payment = true
                this.validateInputStepPayment()

                if (Object.keys(this.inputError).length < 1) {
                    this.orderId = (this.orderId) ? this.orderId : this.generateOrderId(5)
                    this.stepForm = 'finish'
                }
            }
        },
        validateInputStepDelivery() {
            if (this.checkRealTimeValidation.delivery === true) {
                this.inputError = {}
                
                if (this.form.dropshiper_status){
                    this.validateRequired(this.inputError, this.form, 'dropshiper_name', 'Dropshipper name is required!')
                    this.validateRequired(this.inputError, this.form, 'dropshiper_phone', 'Dropshipper phone number is required!')
                    this.validateMinMax(this.inputError, this.form, 'dropshiper_phone', 6, 20, 'Phone')
                    this.validatePhone(this.inputError, this.form, 'dropshiper_phone', 'Phone is not valid. Input allowed only 0-9,-,+,(,)')
                }

                this.validateRequired(this.inputError, this.form, 'email', 'Email is required!')
                this.validateRequired(this.inputError, this.form, 'phone', 'Phone number is required!')
                this.validateRequired(this.inputError, this.form, 'delivery_address', 'Delivery address is required!')
                this.validateMinMax(this.inputError, this.form, 'phone', 6, 20, 'Phone number')
                this.validatePhone(this.inputError, this.form, 'phone', 'Phone number is not valid. Input allowed only 0-9,-,+,(,)')
                this.validateEmail(this.inputError, this.form, 'email', 'Email is not valid')
            }
        },
        validateInputStepPayment() {
            if (this.checkRealTimeValidation.payment === true) {
                this.inputError = {}
                this.validateRequired(this.inputError, this.form, 'delivery_method', 'Delivery method is required!', true)
                this.validateRequired(this.inputError, this.form, 'payment_method', 'Payment method is required!', true)
            }
        },
        validateMinMax(inputError, form, inputName, min, max, label) {
            if (form[inputName]) {
                var text = form[inputName]
                var errorMessage = '';

                if (min > 0 && text.length < min) {
                    errorMessage = label + ' is not valid, minimal character is ' + min
                } else if (max > 0 && text.length > max){
                    errorMessage = label + ' is not valid, maximal character is ' + max
                }
                
                if (errorMessage) {
                    inputError[inputName] = errorMessage
                }
            }
        },
        validateEmail(inputError, form, inputName, text) {
            if (form[inputName]) {
                var email = form[inputName]
                var emailRGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                var emailResult = emailRGEX.test(email);
                
                if (emailResult === false) {
                    inputError[inputName] = text
                }
            }
        },
        validatePhone(inputError, form, inputName, text) {
            if (form[inputName]) {
                var phone = form[inputName]
                var phoneResult = true
                var chars = '0123456789+-()'
                var valid = false

                for (var i = 0; i < phone.length; i++) {
                    valid = false
                    for (var j = 0; j < chars.length; j++) {
                        if (phone[i] == chars[j]){
                            valid = true
                        }
                    }

                    if (valid === false)
                        phoneResult = false
                }

                if (phoneResult === false) {
                    inputError[inputName] = text
                }
            }
        },
        validateRequired(inputError, form, inputName, text, object = false){
            if (object === true) {
                if (!inputError[inputName] && Object.keys(form[inputName]).length < 1) {
                    inputError[inputName] = text
                }
            } else {
                if (!inputError[inputName] && !form[inputName]) {
                    inputError[inputName] = text
                }
            }
        },
        validateLimitInput(input, limit){
            input = input.substr(0, limit)
            return input.substr(0, limit)
        },
        generateOrderId(length, chars) {
            var chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
            var result = ''
            for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
            return result
        },
        clearData() {
            localStorage.removeItem('form')
            localStorage.removeItem('orderId')
            localStorage.removeItem('stepForm')
            location.reload();
        },
        heperText(name, validity) {
            if (!this.inputError[name] && validity === true) {
                return `
                    <img src="assets/image/icon/check.png" alt="success" class="floating__icon"/>
                `
            } else if (this.inputError[name]) {
                return `
                    <img src="assets/image/icon/close.png" alt="failed" class="floating__icon"/>
                    <small class="floating__help__text text--error">
                        `+this.inputError[name]+`
                    </small>
                `
            }
        },
    },
    created() {
        if (localStorage.form) {
            this.form = JSON.parse(localStorage.form)
            this.calculateDropshiperFee()

            if (Object.keys(this.form.delivery_method).length > 0)
                this.calculateDeliveryFee(this.form.delivery_method)

            if (Object.keys(this.form.payment_method).length > 0)
                this.selectPayment(this.form.payment_method)
        }

        if (localStorage.orderId)
            this.orderId = localStorage.orderId

        if (localStorage.stepForm)
            this.stepForm = localStorage.stepForm

        this.calculatePaymentTotal()
    },
    watch: {
        'form.dropshiper_status': function (val) {
            this.calculateDropshiperFee()
            this.validateInputStepDelivery()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'form.email': function (val) {
            this.validateInputStepDelivery()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'form.phone': function (val) {
            this.validateInputStepDelivery()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'form.delivery_address': function (val) {
            this.form.delivery_address = this.validateLimitInput(val, this.deliveryAddresLimit)
            this.validateInputStepDelivery()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'form.dropshiper_name': function (val) {
            this.validateInputStepDelivery()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'form.dropshiper_phone': function (val) {
            this.validateInputStepDelivery()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'form.delivery_method': function (val) {
            this.validateInputStepPayment()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'form.payment_method': function (val) {
            this.validateInputStepPayment()
            localStorage.setItem('form', JSON.stringify(this.form))
        },
        'orderId': function (val) {
            localStorage.setItem('orderId', val)
        },
        'stepForm': function (val) {
            localStorage.setItem('stepForm', val)
        },
    }
}).mount('#checkout')