import { useParams } from 'react-router-dom';
import { InsightsPageTemplate } from '../components/insights/InsightsPageTemplate';
import { slugToCategoryName } from '../utils/insightsHelpers';

export const InsightsCategory = () => {
  const { category } = useParams<{ category: string }>();
  const categoryName = slugToCategoryName(category);
  return <InsightsPageTemplate pageTitle={categoryName} category={categoryName} />;
};

export default InsightsCategory;
