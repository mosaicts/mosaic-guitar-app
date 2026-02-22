import { Link, redirect, useLoaderData } from 'react-router';
import { fetchGuitars } from '../../utils/apis';
import type { Guitar } from '@/utils/models';
import './index.css';

export async function clientLoader() {
  console.log('running client loader...');
  // if (getJwt()) {
  console.log('loading guitars...');
  try {
    const guitars = await fetchGuitars();
    console.log('guitars loaded');
    return guitars;
  } catch {
    return redirect('/login');
  }
  // }
}

export default function Home() {
  const guitars = useLoaderData<typeof clientLoader>() as Guitar[];
  // const guitars = loaderData;

  return (
    <div id="index-page">
      <main>
        <h1 id="title">Featured Guitars</h1>
        <div id="content-container">
          {guitars.map((guitar) => (
            <div key={guitar.id} id="content-item">
              <Link to={`/guitars/${guitar.id.toString()}`}>
                <div id="panel">
                  <div id="img-grid">
                    <img src={guitar.image} alt={guitar.name} className="guitar-image" />
                    <div id="lining"></div>
                  </div>
                  <div id="action">View Details</div>
                </div>
                <div id="details">
                  <h2 className="name">{guitar.name}</h2>
                  <p id="short-description">{guitar.shortDescription}</p>
                  <div className="price">${guitar.price}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
