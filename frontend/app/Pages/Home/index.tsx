import { Link, redirect, useLoaderData } from 'react-router';
import { fetchGuitars } from '../../utils/apis';
import type { Guitar } from '@/utils/models';
import './index.css';

export async function clientLoader() {
  console.log('Run home loader...');
  try {
    const guitars = await fetchGuitars();
    console.log('guitars loaded');
    return guitars;
  } catch {
    return redirect('/login');
  }
}

export default function Home() {
  const guitars = useLoaderData<typeof clientLoader>() as Guitar[];
  // const guitars = loaderData;

  return (
    <div className="home">
      <main>
        <h1>Featured Guitars</h1>
        <div className="grid">
          {guitars.map((guitar) => (
            <div key={guitar.id} className="item">
              <Link to={`/guitars/${guitar.id.toString()}`}>
                <div className="panel">
                  <div className="image">
                    <img src={guitar.image} alt={guitar.name} className="guitar" />
                    <div className="lining"></div>
                  </div>
                  <div className="action">View Details</div>
                </div>
                <div className="details">
                  <h2 className="name">{guitar.name}</h2>
                  <p className="description short">{guitar.shortDescription}</p>
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
