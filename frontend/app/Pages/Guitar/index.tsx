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
    <div className="details-panel">
      <div className="container">
        <Link className="back" to="/">
          &larr; Back to all guitars
        </Link>
        <div className="info-container">
          <h1 className="name">{guitar.name}</h1>
          <p className="description">{guitar.description}</p>
        </div>
        <div className="price-container">
          <div className="price">${guitar.price}</div>
          <button
            onClick={() => {
              setAddCart(true);
              setTimeout(() => setAddCart(false), 3000);
            }}
            className="cart btn"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="img-panel">
        <div className="img-container">
          <img src={`../../${guitar.image}`} alt={guitar.name} />
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
      <div className="background">
        <div className="modal">
          <img src="/app/Images/tick_icon.svg" width="1" height="1" />
          <p>Item added</p>
        </div>
      </div>
    )
  );
}
