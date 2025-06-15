import axios from 'axios';

const BASE_URL = 'https://graph.facebook.com/v19.0';
const { ACCESS_TOKEN, IG_USER_ID } = process.env;

export const getProfileInsights = async () => {
  const metrics = 'impressions,reach,profile_views,followers_count';
  const period = 'day';

  const { data } = await axios.get(`${BASE_URL}/${IG_USER_ID}/insights`, {
    params: {
      metric: metrics,
      period,
      access_token: ACCESS_TOKEN,
    },
  });

  return data;
};

export const getRecentPostsInsights = async () => {
  const { data: mediaResp } = await axios.get(`${BASE_URL}/${IG_USER_ID}/media`, {
    params: {
      access_token: ACCESS_TOKEN,
    },
  });

  const posts = mediaResp.data.slice(0, 5);

  const postsWithInsights = await Promise.all(
    posts.map(async (post) => {
      const { data: insights } = await axios.get(`${BASE_URL}/${post.id}/insights`, {
        params: {
          metric: 'impressions,reach,engagement,saved,likes,comments',
          access_token: ACCESS_TOKEN,
        },
      });

      return {
        ...post,
        insights,
      };
    })
  );

  return postsWithInsights;
};
