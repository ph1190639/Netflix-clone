import React, { useEffect, useState } from 'react';
import './PlansScreen.css';
import { collection, getDocs, query, where, getFirestore, addDoc, onSnapshot } from 'firebase/firestore';
import db from './firebase';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { loadStripe } from '@stripe/stripe-js'

function PlansScreen() {
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subscriptionSnapshot = await getDocs(collection(db, 'customers', user.uid, 'subscriptions'));

        const subscriptionsData = subscriptionSnapshot.docs.map((subscriptionDoc) => {
          const subscriptionData = subscriptionDoc.data();
          return {
            id: subscriptionDoc.id,
            role: subscriptionData.role,
            current_period_end: subscriptionData.current_period_end?.seconds || 0,
            current_period_start: subscriptionData.current_period_start?.seconds || 0,
          };
        });

        if (subscriptionsData.length === 1) {
          // If there is exactly one subscription, set it as the state
          setSubscription(subscriptionsData[0]);
        } else if (subscriptionsData.length > 1) {
          // If there are multiple subscriptions, handle accordingly (e.g., display a message or log to console)
          console.warn('Multiple subscriptions found for the user:', user.uid);
          // You can choose to set the first subscription or implement specific handling logic
          setSubscription(subscriptionsData[0]);
        } else {
          // If there are no subscriptions, handle accordingly (e.g., display a message or log to console)
          console.warn('No subscriptions found for the user:', user.uid);
          // You can choose to set the state to null or implement specific handling logic
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchSubscription();
  }, [user.uid]);


  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('active', '==', true));

      try {
        const querySnapshot = await getDocs(q);

        const productsData = await Promise.all(
          querySnapshot.docs.map(async (productDoc) => {
            const product = {
              id: productDoc.id,
              ...productDoc.data(),
            };

            // Fetch prices
            const priceSnapshot = await getDocs(collection(productDoc.ref, 'prices'));

            product.prices = priceSnapshot.docs.map((price) => ({
              priceId: price.id,
              priceData: price.data(),
            }));

            return product;
          })
        );

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const loadCheckout = async (user, priceId) => {
    const firestore = getFirestore();
  
    try {
      const docRef = await addDoc(collection(firestore, 'customers', user.uid, 'checkout_sessions'), {
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });
  
      onSnapshot(docRef, async (snap) => {
        const { error, sessionId } = snap.data();
        if (error) {
          alert(`An error occurred: ${error.message}`);
        }
        if (sessionId) {
          const stripe = await loadStripe(
            "pk_test_51OiLZWSGtNWvHtjiMPejnccu8tK9EzCPwJVk2AcSh90XgPQ8uNGbRa6FzjrTtjrBA05cpHGD8iiMQtBnjRZ53CG7004jRIPJ9t"
          );
          stripe.redirectToCheckout({ sessionId });
        }
      });
    } catch (error) {
      console.error('Error adding document:', error);
    }

  }

  //const isCurrentPackage = product.name?.toLowerCase().includes(subscription?.role);

  return (
    <div className='plansScreen'>
      <br/>
      {subscription && <p>Renewal Date: {new Date(subscription?.current_period_end * 1000).toLocaleDateString()}</p>}
      {products.map((product) => {
        const productNameLower = product.name?.toLowerCase();
        const subscriptionRoleLower = subscription?.role?.toLowerCase();
        const isCurrentPackage = productNameLower?.includes(subscriptionRoleLower);

      

        return (
          
          <div className={`${isCurrentPackage && "planScreen__plan--disabled"} planScreen__plan`} key={product.id}>
            <div className='planScreen__info'>
              <h5>{product.name}</h5>
              <h6>{product.description}</h6>
            </div>
            <button onClick={() => !isCurrentPackage && loadCheckout(user, product.prices[0]?.priceId)}>
              {isCurrentPackage ? "Current Package" : "Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PlansScreen;





