
const eventBus =    new Vue();

Vue.component('product-details',{
    props:{
        details:{
            type:Array,
            required: true,
        },
    },
    template: 
    `<ul>
        <li v-for="detail in details"> {{ detail }}</li>
    </ul>`
})

Vue.component('product',{
   props: {
       premium:{
           type: Boolean,
           required: true, 
       },
       cart:{
           type: Array,
           required: true,
       }
    },
   template: `
    <div class="product">

        <div class="product-image">
            <img :src="image" />
        </div>

        <div class="product-info">
            
            <h1>{{ title }}</h1>
            <p v-if="inStock"> In Stock </p>
            <p v-else> Out of Stock</p>
            <p>Shipping: {{ shipping }}</p>
            
            <product-details :details="details"></product-details>

            <div class="color-box" 
                v-for="(variant,index) in variants" 
                :key="variant.variantId" 
                :style="{backgroundColor: variant.variantColor}"
                @mouseover="updateProduct(index)" >
            </div>

            <button @click="addToCart()"
                :disabled="!inStock"
                :class="{disabledButton : !inStock}"
            >Add to Cart</button>
            <button  @click="removeToCart()"
                    :disabled="!inCart"
                    :class="{disabledButton : !inCart}"
            >Remove to Cart</button>

        </div>

        <div>
        <product-tabs :reviews="reviews"></product-tabs>

       </div>
   

    </div>`,
    data(){
        return  {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariente: 0,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: "/img/vmSocks-green.jpg",
                    variantQuantity: 10,
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: "/img/vmSocks-blue.jpg",
                    variantQuantity: 3,
                }
            ],
            reviews: [],
        }
    },
    methods: {
        addToCart(){
            this.variants[this.selectedVariente].variantQuantity--;
            this.$emit('add-to-cart', this.variants[this.selectedVariente].variantId);
        },
        removeToCart(){
            this.variants[this.selectedVariente].variantQuantity++;
            this.$emit('remove-to-cart',this.variants[this.selectedVariente].variantId);
        },
        updateProduct(index){
            this.selectedVariente = index;
        },
    },
    computed : {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariente].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariente].variantQuantity;
        },
        shipping(){
            if (this.premium)
                return 'Free';

            return 2.99;
        },
        inCart(){
            for (index in this.cart){
                if (this.variants[this.selectedVariente].variantId === this.cart[index]){
                    return true;
                }
            }
            return false;
        }
    },
    mounted(){
        eventBus.$on('review-submitted',productReview => {
            this.reviews.push(productReview)
          })
    }
});

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
    </p>
    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name" placeholder="name">
    </p>
    
    <p>
      <label for="review">Review:</label>      
      <textarea id="review" v-model="review"></textarea>
    </p>
    
    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>
    
    <div>
        <p>Você gostou do produto?</p>
        <label for="sim">Sim</label>
        <input type="radio" name="quest" value="Sim" id="sim" v-model="quest" />
        <label for="não">Não</label>
        <input type="radio" name="quest" value="Não" id="não" v-model="quest" />
    </div>
        
    <p>
      <input type="submit" value="Submit">  
    </p>    
  
  </form>
    `,
    data(){
        return {
            name: null,
            review:  null,
            rating: null,
            quest: null,
            errors: [],
        }
    },
    methods:{
        onSubmit(){
            this.errors = [];
            if(this.name && this.review && this.rating && this.quest){
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    quest: this.quest,
                }
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.quest = null;
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.quest) this.errors.push("Quest required.")
            }
        }
    }
});

Vue.component('product-tabs', {
    template: `
    <div>
        <div>
            <span class="tab"
                :class="{activeTab: selectedTab === tab}" 
                v-for="(tab, index) in tabs" 
                :key="index"
                @click="selectedTab = tab">
                {{ tab }}
            </span>
        </div>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                    <p>{{ review.name }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                    <p>Gostou: {{ review.quest }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
            <product-review></product-review> 
        </div>
    </div>
    `,
    props:{
        reviews:{
            type: Array,
            required: true,
        }
    },
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews',      
      }
    },
    methods:{

    }
  })


var app = new Vue({
    el : "#app",
    data:{
        premium: true,
        cart: [],
    },
    methods : {
        updateCart(id){
            this.cart.push(id);
        },
        removeCart(id){
            let oldCart = this.cart;
            let newCart = this.cart
            for (let index = 0; index < oldCart.length; index++){
                if (newCart[index] === id){
                    newCart = oldCart.slice(0,index)
                    newCart = newCart.concat(oldCart.slice(index+1)); 
                }

                if (newCart != oldCart)
                    break;
            }

            this.cart = newCart;
        }
    }
})