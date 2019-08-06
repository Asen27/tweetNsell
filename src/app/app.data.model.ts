export class Brand {
    user_profile: UserProfile;
    id: string;
    name: string;
    location: string;
    description: string;
    language: string;
    url: string;
    is_verified: boolean;
    number_new_opinions: Number;
    number_new_followers: Number;
    followers_cursor: string;
    social_rating;
    service_industry: ServiceIndustry;
    competitor: Competitor[];
  }

  export class Competitor {
      user_profile: UserProfile;
      name: string;
      is_verified: boolean;
      social_rating;
  }

  export class Administrator {
    user_profile: UserProfile;
  }

  export class ServiceIndustry {
    name_en: string;
    name_es: string;
  }


  export class UserProfile {
    id: Number;
    email: string;
    username: string;
    password: string;
    is_staff: boolean;
}

 export class Customer {
    screen_name: string;
    name: string;
    url: string;
    number_followers: Number;
 }

 export class Opinion {
    id: Number;
    text: string;
    language: string;
    publication_moment: Date;
    number_favorites: Number;
    number_retweets: Number;
    is_latest: boolean;
    is_pinned: boolean;
    attitude: string;
    brand: string;
    author: Customer;
 }

