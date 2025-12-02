import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/index';
import { fetchSingleGuitar } from '@/utils/apis';
import { type Guitar } from '@/utils/models';
import { useState } from 'react';
import './index.css';

export async function clientLoader({ params }: Route.LoaderArgs) {
  const guitar = await fetchSingleGuitar(+params.guitarId);
  if (!guitar) {
    throw new Error('Guitar not found');
  }
  return guitar;
}

export default function Guitar() {
  const [isAddCart, setAddCart] = useState<boolean>(false);
  const guitar: Guitar = useLoaderData();

  return (
    <div id="description-panel">
      <div id="details-container">
        <Link id="back" to="/">
          &larr; Back to all guitars
        </Link>
        <h1 id="name">{guitar.name}</h1>
        <p id="description">{guitar.description}</p>
        <div id="price-div">
          <div id="price">${guitar.price}</div>
          <button
            onClick={() => {
              setAddCart(true);
              setTimeout(() => setAddCart(false), 3000);
            }}
            id="cart-btn"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div id="full-img-panel">
        <div id="full-img-div">
          <img id="full-img" src={`../../${guitar.image}`} alt={guitar.name} />
        </div>
      </div>
      <Modal isShown={isAddCart} />
    </div>
  );
}

interface ModalTypes {
  isShown: boolean;
}

function Modal({ isShown }: ModalTypes) {
  return (
    isShown && (
      <div className="modal-bg">
        <div className="modal">
          <img src="/app/Images/tick_icon.svg" width="1" height="1" />
          <p>Item added</p>
        </div>
      </div>
    )
  );
}
