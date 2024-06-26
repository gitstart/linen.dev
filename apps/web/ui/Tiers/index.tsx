import { useState } from 'react';
import classNames from 'classnames';
import { SerializedAccount, Period } from '@linen/types';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import Card from './Card';
import Toast from '@/Toast';
import styles from './index.module.scss';

interface Tier {
  id: string;
  name: string;
  description: string;
  href: string;
  features: string[];
  priceId: string;
  price: string;
  active?: boolean;
}

interface Props {
  tiers: Tier[];
  activePeriod: Period;
  currentCommunity: SerializedAccount;
}

export default function Tiers({
  currentCommunity,
  tiers,
  activePeriod,
}: Props) {
  const [loading, setLoading] = useState(false);
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => {
        const active = false; // tier.name === 'Vici';

        const onSubmit = (event: any) => {
          event.preventDefault();
          event.stopPropagation();
          setLoading(true);
          fetch('/api/plans', {
            method: 'POST',
            body: JSON.stringify({
              communityId: currentCommunity.id,
              priceId: tier.priceId,
              successUrl: window.location.href,
              cancelUrl: window.location.href,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then((response) => response.json())
            .then(({ redirectUrl }) => (window.location = redirectUrl))
            .catch(() => {
              Toast.error('Something went wrong. Please try again later.');
            })
            .finally(() => {
              setLoading(false);
            });
        };
        return (
          <Card
            key={tier.name}
            title={tier.name}
            description={tier.description}
            price={tier.price}
            period={activePeriod}
            active={active}
          >
            <button
              type="submit"
              className={classNames(styles.button, {
                [styles.active]: active,
              })}
              onClick={onSubmit}
              disabled={loading}
            >
              {active && <FiZap />}
              Buy plan
            </button>
            <div>
              <ul className={styles.list}>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <FiCheck />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
